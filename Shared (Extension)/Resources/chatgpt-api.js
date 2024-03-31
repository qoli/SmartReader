const API_KEY = "sk-MUmZpeZrINTZ6o4I6fD3B197615049E1Ae8e1a312aA11969";
const API_URL = "https://www.gptapi.us/v1/chat/completions";

const MIN_CHARS = 0;
let userSpan, charSpan;

async function chatGPT_API_Completions(text) {
  //Cache DOM elements to avoid unnecessary DOM traversals

  let responseElem = document.getElementById("response");

  let systemText = "你是一個文章概括專家。請按照下面的要求概括文章內容。";
  let assistantText = "";
  let promptText = `
為最後提供的文字內容進行按要求的總結。如果是其他語言，請翻譯到繁體中文。
請嚴格按照下面的格式進行輸出，在格式以外的地方，不需要多餘的文本內容。

這裡是格式指導：
總結：
簡短的一句話概括內容，此單獨佔用一行，記得輸出換行符號；
要點：
對文字內容提出多個要點內容，並每一個要點都附加一個裝飾用的 emoji，每一個要點佔用一行，注意記得輸出換行符號；

下面為需要總結的文字內容：
<
  `;

  let userText = promptText + text + ">";

  if (text) {
    try {
      const messages = [];

      // add the system message
      const systemMessage = {
        role: "system",
        content: systemText,
      };
      if (systemText.length > 0) {
        messages.push(systemMessage);
      }

      // add the assistant message
      const assistantMessage = {
        role: "assistant",
        content: assistantText,
      };
      if (assistantText.length > 0) {
        messages.push(assistantMessage);
      }

      // add the user message
      const userMessage = {
        role: "user",
        content: userText,
      };
      if (userText.length > 0) {
        messages.push(userMessage);
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + API_KEY,
        },
        body: JSON.stringify({
          // stream: true,
          model: "gpt-3.5-turbo",
          messages: messages,
          temperature: 0,
        }),
      });

      if (!response.ok) {
        console.error(
          "HTTP ERROR: " + response.status + "\n" + response.statusText
        );
        typeSentence("HTTP ERROR: " + response.status, responseElem);
      } else {
        const data = await response.json();
        typeSentence(createResponse(data), responseElem, data, true);
      }
    } catch (error) {
      console.error("ERROR: " + error);
    }
  } else {
    await typeSentence("未能構建 userText", responseElem);
  }
}

function removePeriod(json) {
  json.forEach(function (element, index) {
    if (element === ".") {
      json.splice(index, 1);
    }
  });
  return json;
}

function createResponse(json) {
  let response = "";
  let choices = removePeriod(json.choices);
  if (choices.length > 0) {
    response = json.choices[0].message.content;
  }

  return response;
}

async function typeSentence(
  sentence,
  elementReference,
  data,
  isReceipt = false,
  delay = 30
) {
  elementReference.innerText = "";
  if (sentence === "HTTP ERROR: 401") {
    sentence +=
      " — Please make sure that your Open AI API Key has been set properly.";
  }
  const letters = sentence.split("");
  let i = 0;
  while (i < letters.length) {
    await waitForMs(delay);
    elementReference.append(letters[i]);
    i++;
  }

  // END ...
  if (isReceipt) {
    let resultText = document.getElementById("response").innerHTML;

    document.getElementById("response").innerHTML = "";

    document.getElementById("receiptTitle").innerHTML =
      extractSummary(resultText);
    document.getElementById("receipt").innerHTML = marked.parse(
      postProcessText(excludeSummary(resultText))
    );
  }

  return;
}

function waitForMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createReceipt() {
  return "";
}

function setRow(name, value, setWordCount) {
  let description = value;
  if (setWordCount === true) {
    description = value + " (~" + +Math.round(value * 0.75) + " words)";
  }
  return "<tr><td>" + name + "</td><td>" + description + "</td></tr>";
}

function calculateCost(engineName, totalTokens, wordCount = false) {
  let totalCost = 0;
  //Prices per 1000 tokens
  const CHATGPT_PRICE = 0.002;

  let pricePerToken = totalTokens / 1000;
  totalCost = CHATGPT_PRICE * pricePerToken;

  return totalCost.toFixed(10);
}

function convertEpochToDateTime(epoch) {
  let date = new Date(epoch * 1000);
  return date.toLocaleString();
}

function getTimeColor() {
  let color = "dark";
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour < 19) {
    color = "light";
  }
  return color;
}

function postProcessText(text) {
  return text
    .trim()
    .replaceAll("  ", "")
    .replaceAll("\t", "")
    .replaceAll("\n\n", "")
    .replaceAll(",,", "");
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
