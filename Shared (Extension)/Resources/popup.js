function sendMessageToContent(message) {
  browser.tabs.query({ active: true }).then(function (currentTabs) {
    if (currentTabs[0].id >= 0) {
      browser.tabs.sendMessage(currentTabs[0].id, message);
    }
  });
}

function getDebugText() {
  sendMessageToContent("getDebugText");
}

function addMessageListener() {
  browser.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    console.log("MessageListener", request);

    if (request.message) {
      if (request.message == "debugText") {
        document.querySelector("#ReadabilityText").innerHTML = request.body;
      }
    }
  });
}

function addClickListeners() {
  // 取得所有具有 clickListen 類別的按鈕
  const buttons = document.querySelectorAll(".clickListen");

  console.log(buttons);

  // 迭代每個按鈕
  buttons.forEach((button) => {
    // 監聽按鈕的點擊事件
    button.addEventListener("click", () => {
      // 取得 data-function 屬性的值
      const functionName = button.getAttribute("data-function");

      console.log("call", functionName);

      // 檢查是否存在 data-function 屬性
      if (functionName) {
        window[functionName]();
      }
    });
  });
}

//
function sendRunSummaryMessage() {
  sendMessageToContent("runSummary");
}

function saveCat() {
  saveData("cat", "tom");
}

function getCat() {
  loadData("cat");
}

function getHostFromUrl(url) {
  const parsedUrl = new URL(url);
  return parsedUrl.host;
}

function mainApp() {
  addMessageListener();

  let lottieURL = browser.runtime.getURL("images/loading.gif");
  document.querySelector("#ReadabilityLoadingIMG").src = lottieURL;

  // 呼叫函式以設置按鈕的點擊事件監聽器
  addClickListeners();
}

// async ...
function callByTimeOut() {
  (async () => {
    let currentTabs = await browser.tabs.query({ active: true });

    document.querySelector("#currentHOST").innerHTML = getHostFromUrl(
      currentTabs[0].url
    );
  })();
}

mainApp();

setTimeout(() => {
  callByTimeOut();
}, 800);
