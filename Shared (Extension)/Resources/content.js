browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content / Received request: ", request);

  if (request == "runSummary") {
    runSummary();

    sendResponse({
      callback: "ok",
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
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24.5333 7.46667L23.6 8.4M4 16H5.33333M16 4V5.33333M26.6667 16H28M7.46667 7.46667L8.4 8.4"
                  stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path
                  d="M12 21.3333C10.8806 20.4938 10.0538 19.3233 9.63656 17.9878C9.21935 16.6522 9.23295 15.2192 9.67542 13.8918C10.1179 12.5644 10.9668 11.4098 12.1019 10.5917C13.237 9.77356 14.6008 9.33331 16 9.33331C17.3992 9.33331 18.7629 9.77356 19.898 10.5917C21.0332 11.4098 21.8821 12.5644 22.3245 13.8918C22.767 15.2192 22.7806 16.6522 22.3634 17.9878C21.9462 19.3233 21.1194 20.4938 20 21.3333C19.4794 21.8486 19.0874 22.4792 18.8558 23.1741C18.6242 23.869 18.5594 24.6087 18.6666 25.3333C18.6666 26.0406 18.3857 26.7188 17.8856 27.2189C17.3855 27.719 16.7072 28 16 28C15.2927 28 14.6145 27.719 14.1144 27.2189C13.6143 26.7188 13.3333 26.0406 13.3333 25.3333C13.4407 24.6087 13.3759 23.869 13.1443 23.1741C12.9127 22.4792 12.5206 21.8486 12 21.3333Z"
                  stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12.9333 22.6667H19.0667" stroke="black" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
          </svg>
      </a>
  </div>
</div>
<div id="ReadabilityFrame">
  <div id="ReadabilityTitle">
      <p class="safariExtensionTitle">AI Summary</p>
      <p class="safariExtensionHost" id="ReadabilityHost">bbc.com</p>
  </div>
  <hr />

  <div id="response" class="typing"></div>
  <div id="receiptTitle"></div>
  <div id="receipt"></div>
  <div id="ReadabilityClose">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12" stroke="#3D3D3D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M4 4L12 12" stroke="#3D3D3D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
  </div>


</div>
  `;

  document.body.insertAdjacentHTML("beforeend", htmlSourceCode);

  document
    .querySelector("#ReadabilityButton")
    .addEventListener("click", runSummary);

  document
    .querySelector("#ReadabilityClose")
    .addEventListener("click", hideView);
}

function hideView() {
  document.querySelector("#ReadabilityFrame").style.display = "none";
  document.querySelector("#ReadabilityBar").style.display = "block";
}

function runSummary() {
  document.querySelector("#ReadabilityFrame").style.display = "block";
  document.querySelector("#ReadabilityBar").style.display = "none";
  callGPT();
}

function callGPT() {
  let response = document.querySelector("#response");
  response.innerHTML = "正在加載中...";

  let coreText = getCoreContentText();
  document.querySelector("#receiptTitle").innerHTML = "";
  document.querySelector("#receipt").innerHTML = "";
  document.querySelector("#ReadabilityHost").innerHTML = window.location.host;
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
