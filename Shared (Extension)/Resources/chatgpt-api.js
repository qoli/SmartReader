let lastReplyMessage = "";
let messagesGroup = [];

async function sendReplytext(text) {
  pushUserMessage(text);
  let elem = getMaxTimestampElem();

  await apiPostMessage(elem, function () {
    markdownMessage(elem);
  });
}

function getMaxTimestampElem() {
  var elements = document.querySelectorAll('[id^="ReplyMessage"]');
  var maxTimestamp = -Infinity;
  var maxTimestampDiv = null;

  Array.from(elements).forEach(function (element) {
    var id = element.id;
    var timestamp = parseInt(id.replace("ReplyMessage", ""));
    if (timestamp > maxTimestamp) {
      maxTimestamp = timestamp;
      maxTimestampDiv = element;
    }
  });

  return maxTimestampDiv;
}

function puashAssistantMessage(text) {
  if (text.length <= 0) {
    return;
  }

  const messageWithRole = {
    role: "assistant",
    content: text,
  };

  messagesGroup.push(messageWithRole);
}

function pushUserMessage(text) {
  if (text.length <= 0) {
    return;
  }

  const messageWithRole = {
    role: "user",
    content: text,
  };

  console.log("UserMessage / length", countTokens(text), text.length);

  messagesGroup.push(messageWithRole);
}

// GPT 總結
async function callGPTSummary(inputText) {
  //Cache DOM elements to avoid unnecessary DOM traversals

  let responseElem = document.getElementById("response");
  lastReplyMessage = "";

  let systemText = "你是幫助用戶理解網頁內容的專家。";
  let assistantText = "";
  let promptText = `為最後提供的文字內容進行按要求的總結。如果是其他語言，請翻譯到繁體中文。
請嚴格按照下面的格式進行輸出，在格式以外的地方，不需要多餘的文本內容。

這裡是格式指導：
總結：
簡短的一句話概括內容，此單獨佔用一行，記得輸出換行符號；
要點：
對文字內容提出多個要點內容，並每一個要點都附加一個裝飾用的 emoji，每一個要點佔用一行，注意記得輸出換行符號；

下面為需要總結的文字內容：
<`;

  callLoading();
  showID("response");

  let userText = promptText + inputText + ">";

  if (userText.length > MAX_TOKEN) {
    console.log("Token,Too Long");
  }

  if (userText.length <= 0) {
    typeSentence("userText Empty", responseElem);
    return;
  }

  if (inputText) {
    const systemMessage = {
      role: "system",
      content: systemText,
    };
    if (systemText.length > 0) {
      messagesGroup.push(systemMessage);
    }

    puashAssistantMessage(assistantText);
    pushUserMessage(userText);

    try {
      await apiPostMessage(responseElem, function () {
        hideID("response");
        hideLoading();
        setupSummary();

        uiFocus(document.getElementById("ReadabilityFrame"));
      });
    } catch (error) {
      typeSentence("API Error:" + error, responseElem);
    }
  } else {
    typeSentence("未能構建 userText", responseElem);
  }
}

function uiFocus(responseElem) {
  responseElem.classList.add("readabilityDone");
  setTimeout(() => {
    responseElem.classList.remove("readabilityDone");
  }, 1600);
}

async function apiPostMessage(responseElem, callback) {
  lastReplyMessage = ""; //reset LastMessage

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + API_KEY,
    },
    body: JSON.stringify({
      stream: true,
      model: API_MODEL,
      messages: messagesGroup,
      temperature: 0,
    }),
  });

  const reader = response.body
    ?.pipeThrough(new TextDecoderStream())
    .getReader();

  if (!reader) return;

  let errorResponse;

  try {
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await reader.read();
      if (done) break;
      let dataDone = false;
      const arr = value.split("\n");

      errorResponse = arr[0];

      arr.forEach((data) => {
        if (data.length === 0) return; // ignore empty message
        if (data.startsWith(":")) return; // ignore sse comment message
        if (data === "data: [DONE]") {
          dataDone = true;
          return;
        }

        let choice = JSON.parse(data.substring(6)).choices[0];
        let token = choice.delta.content;

        if (choice.finish_reason == "stop") {
          token = token;
          dataDone = true;
        }

        typeSentence(token, responseElem);
      });

      if (dataDone) {
        console.log("#dataDone", dataDone);
        puashAssistantMessage(lastReplyMessage);

        // 在适当的时候调用回调函数
        if (callback && typeof callback === "function") {
          callback();
        }
        break;
      }
    }
  } catch (error) {}

  if (!response.ok) {
    let errorJSON = JSON.parse(errorResponse);

    console.error(
      "HTTP ERROR: " + response.status + "\n" + response.statusText
    );

    typeSentence(
      "Status: " + response.status + "\n" + errorJSON.error.message,
      responseElem
    );
  }
}

function markdownMessage(elementReference) {
  elementReference.innerHTML = marked.parse(postProcessText(lastReplyMessage));
}

function typeSentence(sentence, elementReference) {
  lastReplyMessage += sentence;
  elementReference.innerText = lastReplyMessage;

  return;
}

function setupSummary() {
  let resultText = document.getElementById("response").innerHTML;

  document.getElementById("response").innerHTML = "";
  document.getElementById("receiptTitle").innerHTML = removeBR(
    extractSummary(resultText)
  );
  document.getElementById("receipt").innerHTML = formatMarkdown(
    marked.parse(postProcessText(excludeSummary(resultText)))
  );
}

function postProcessText(text) {
  return text
    .trim()
    .replaceAll("  ", "")
    .replaceAll("\t", "")
    .replaceAll("\n\n", "")
    .replaceAll(",,", "");
}

function removeBR(text) {
  return text.trim().replaceAll("<br>", "");
}

function extractSummary(text) {
  const regex = /總結：([\s\S]+?)要點：/;
  const match = text.match(regex);
  if (match && match.length >= 2) {
    return match[1];
  }
  return "";
}

function excludeSummary(text) {
  const regex = /總結：([\s\S]+?)要點：/;
  const excludedText = text.replace(regex, "");
  return excludedText;
}

function formatMarkdown(inputString) {
  return inputString.replace(/^(<p><br>)/, "<p>").replace(/<br><br>/g, "<br>");
}

function callLoading() {
  document.querySelector("#ReadabilityLoading").style.display = "flex";
  document.querySelector("#ReadabilityLoading").classList.remove("fadeOut");
  document.querySelector("#ReadabilityLoading").classList.add("fadeIn");
}

function hideLoading() {
  document.querySelector("#ReadabilityLoading").classList.remove("fadeIn");
  document.querySelector("#ReadabilityLoading").classList.add("fadeOut");

  setTimeout(() => {
    document.querySelector("#ReadabilityLoading").style.display = "none";
  }, 800);
}

function hideID(idName) {
  document.querySelector("#" + idName).style.display = "none";
}

function showID(idName) {
  document.querySelector("#" + idName).style.display = "block";
}

function countTokens(text) {
  // 使用正则表达式将文本按照非字母数字字符进行分词
  var tokens = text.split(/[^\w\u4e00-\u9fa5]+/);
  // 过滤掉空的Token
  tokens = tokens.filter(function (token) {
    return token.length > 0;
  });
  // 返回Token的数量
  return tokens.length;
}
