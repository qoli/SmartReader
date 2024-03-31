browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("content / Received request: ", request);
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
      <a href="javascript:void(0)" id="ReadabilityButton">Summarize</a>
    </div>
  </div>
  <div id="ReadabilityFrame">
    <div id="response" class="typing"></div>
    <div id="receipt"></div>
  </div>
  
  `;

  document.body.insertAdjacentHTML("beforeend", htmlSourceCode);

  document
    .querySelector("#ReadabilityButton")
    .addEventListener("click", runReadabilityView);
}

// 弹出警告框的函数
function runReadabilityView() {
  let readabilityButton = document.querySelector("#ReadabilityButton");
  if (readabilityButton.innerHTML == "Summarize") {
    callGPT();
    readabilityButton.innerHTML = "Hide";
  } else {
    hideView();
    readabilityButton.innerHTML = "Summarize";
  }
}

function hideView() {
  let readabilityFrameView = document.querySelector("#ReadabilityFrame");
  readabilityFrameView.style.display = "none";
}

function callGPT() {
  let readabilityFrameView = document.querySelector("#ReadabilityFrame");
  readabilityFrameView.style.display = "block";

  let response = document.querySelector("#response");
  response.innerHTML = "正在加載中...";

  let coreText = getCoreContentText();
  document.querySelector("#receipt").innerHTML = coreText;
  chatGPT_API_Completions(coreText);
}

function getCoreContentText() {
  if (isProbablyReaderable(document)) {
    let article = new Readability(document.cloneNode(true), {}).parse();
    console.log("...isProbablyReaderable");
    console.log(article.textContent);
    return postProcessText(article.textContent);
  }
}

function postProcessText(text) {
  return text
    .trim()
    .replaceAll("  ", "")
    .replaceAll("\t", "")
    .replaceAll("\n\n", "")
    .replaceAll(",,", "");
}

// function sendDOM() {
//   browser.runtime
//     .sendMessage({
//       mode: "sendReader",
//       currentURL: document.URL,
//       viewDOM: cloneDOM(),
//     })
//     .then((response) => {
//       console.log("content / Received response: ", response);
//     });
// }
