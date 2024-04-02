browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content / Received request: ", request);

  if (request == "runSummary") {
    runSummary();

    sendResponse({
      callback: "runSummary-ok",
    });
  }

  if (request == "coreContentText") {
    buildCoreContentText();

    sendResponse({
      callback: "coreContentText-ok",
    });
  }
});

if (document.readyState !== "loading") {
  ready();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    ready();
  });
}

function ready() {
  insertHtml();
}

function insertHtml() {
  var readabilityBar = document.querySelector("#ReadabilityBar");

  if (readabilityBar) {
    return;
  }

  var htmlSourceCode = `
<div id="ReadabilityBar">
<div id="viewBar">
    <a href="javascript:void(0)" id="ReadabilityButton">
        <svg width="32" height="30" viewBox="0 0 32 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M0 11.4445C0 5.55346 4.77563 0.777832 10.6667 0.777832H17.7778C23.6688 0.777832 28.4444 5.55346 28.4444 11.4445V18.5556C28.4444 24.4467 23.6688 29.2223 17.7778 29.2223H2.66666C1.19391 29.2223 0 28.0284 0 26.5556V11.4445Z"
                fill="#FFD86D" />
            <circle cx="14.2222" cy="12.3333" r="4.44444" stroke="black" stroke-width="1.77778" />
            <circle cx="26.6667" cy="12.3333" r="4.44444" stroke="black" stroke-width="1.77778" />
            <path d="M15.1111 11.8889V13.6667" stroke="black" stroke-width="1.77778" stroke-linecap="round" />
            <path d="M21.5556 11.4443H19.5556" stroke="black" stroke-width="1.77778" stroke-linecap="round" />
            <path d="M25.7778 11.8889V13.6667" stroke="black" stroke-width="1.77778" stroke-linecap="round" />
            <path d="M16.8889 21.512V21.512C19.4382 21.9829 22.0719 21.567 24.352 20.3334V20.3334"
                stroke="black" stroke-width="1.77778" stroke-linecap="round" />
        </svg>
    </a>
</div>
</div>
<!-- ReadabilityBar / End  -->

<div id="ReadabilityBoxFrame">
<div class="readabilityBlurBox"></div>
<div id="ReadabilityBox" class="ReadabilityFont" >

<div id="ReadabilityKeyboard" class="ReadabilityStyle morePadding">
<div class="readabilityInput fixMorePadding">
<textarea id="ReadabilityTextarea" placeholder="Reply(Enter for Send)" rows="1" cols="1"
    class="readabilityInsideStyle"></textarea>
<div id="ReadabilityClose" class="readabilityInsideStyle">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 12" stroke="#3D3D3D" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" style="--noir-inline-color: #959eae" data-noir-inline-color=""></path>
        <path d="M4 4L12 12" stroke="#3D3D3D" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" style="--noir-inline-color: #959eae" data-noir-inline-color=""></path>
    </svg>
</div>

<div id="ReadabilitySend" class="readabilityInsideStyle" style="display: none">
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round"
        stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 14 21 3"></path>
        <path d="m21 3-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1L21 3Z"></path>
    </svg>
</div>
</div>
</div>
<!-- ReadabilityKeyboard / End  -->

<div id="ReadabilityMessageGroup">
<div id="ReadabilityFrame" class="ReadabilityStyle morePadding">
    <div id="ReadabilityLoading">
        <img src="${lottieURL}" height="48" width="48" alt="loading" />
        <span>Eison · 愛省流君</span>
    </div>
    <div id="response" class="typing"></div>
    <div id="receiptTitle"></div>
    <div id="receipt"></div>
</div>
</div>
<!-- ReadabilityMessageGroup / End  -->

<div id="ReadabilityUserinfo" class="ReadabilityStyle morePadding">
<div class="safariExtensionUserInfo">
    <p class="safariExtensionTitle" id="ReadabilityTitle">Title</p>
    <p class="safariExtensionHost readabilityTips" id="ReadabilityHost">
        www
    </p>
</div>
</div>
<!-- ReadabilityUserinfo / End  -->

<div id="ReadabilityAnchor"></div>

</div>
<!-- ReadabilityBox / End  -->
</div>
`;

  document.body.insertAdjacentHTML("beforeend", htmlSourceCode);

  document
    .querySelector("#ReadabilityButton")
    .addEventListener("click", runSummary);

  document
    .querySelector("#ReadabilityClose")
    .addEventListener("click", hideView);

  document
    .querySelector("#ReadabilitySend")
    .addEventListener("click", sendReply);

  const textArea = document.getElementById("ReadabilityTextarea");
  textArea.addEventListener("input", () => {
    let ln = textArea.value.length;
    if (ln != 0) {
      hideClose();
    } else {
      showClose();
    }
  });

  textArea.addEventListener("keydown", function (event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault(); // 防止換行
      sendReply();
    }
  });
}

function insertMessage(message, userReply) {
  var parentDiv = document.getElementById("ReadabilityMessageGroup");

  // 创建新的 div 元素
  var newDiv = document.createElement("div");
  var timestamp = Date.now(); // 获取当前时间戳
  newDiv.id = "ReplyMessage" + timestamp;

  if (userReply) {
    newDiv.className =
      "ReadabilityStyle morePadding readabilityReply readabilityUserReply";
  } else {
    newDiv.className = "ReadabilityStyle morePadding readabilityReply";
  }

  newDiv.innerText = message;

  parentDiv.appendChild(newDiv);

  document.getElementById("ReadabilityTextarea").value = "";
  showClose();
}

function sendReply() {
  let textValue = document.getElementById("ReadabilityTextarea").value;

  if (textValue.length <= 0) {
    return;
  }

  insertMessage(textValue, true);
  setTimeout(() => {
    insertMessage("...", false);
    sendReplytext(textValue);
  }, 500);
}

function showClose() {
  document.querySelector("#ReadabilityClose").style.display = "flex";
  document.querySelector("#ReadabilitySend").style.display = "none";
}

function hideClose() {
  document.querySelector("#ReadabilityClose").style.display = "none";
  document.querySelector("#ReadabilitySend").style.display = "flex";
}

function hideView() {
  document.querySelector("#ReadabilityBoxFrame").style.display = "none";
  document.querySelector("#ReadabilityBar").style.display = "flex";
}

function runSummary() {
  document.querySelector("#ReadabilityBoxFrame").style.display = "flex";
  document.querySelector("#ReadabilityBar").style.display = "none";
  callGPT();
}

function callGPT() {
  let article = new Readability(document.cloneNode(true), {}).parse();

  if (!article) {
    return;
  }

  document.querySelector("#response").innerHTML = "";
  console.log("...isProbablyReaderable");
  let coreText = postProcessText(article.textContent);

  document.querySelector("#receiptTitle").innerHTML = "";
  document.querySelector("#receipt").innerHTML = "";
  document.querySelector("#ReadabilityTitle").innerHTML = article.title;
  document.querySelector("#ReadabilityHost").innerHTML = window.location.host;

  callGPTSummary(coreText);
}

function postProcessText(text) {
  return text
    .trim()
    .replaceAll("  ", "")
    .replaceAll("\t", "")
    .replaceAll("\n\n", "")
    .replaceAll(",,", "");
}
