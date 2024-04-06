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

function getHostFromUrl(url) {
  const parsedUrl = new URL(url);
  return parsedUrl.host;
}

function saveAPIConfig() {
  (async () => {
    let url = document.querySelector("#APIURL").value;
    let key = document.querySelector("#APIKEY").value;
    let model = document.querySelector("#APIMODEL").value;

    await saveData("APIURL", url);
    await saveData("APIKEY", key);
    await saveData("APIMODEL", model);

    document.querySelector(
      "#ReadabilityText"
    ).innerHTML = `${url} + ${key} + ${model} `;
  })();
}

async function updateConfig() {
  const API_URL = await loadData("APIURL", "https://...");
  const API_KEY = await loadData("APIKEY", "sk-");
  const API_MODEL = await loadData("APIMODEL", "gpt-3.5-turbo");

  document.querySelector("#APIURL").value = API_URL;
  document.querySelector("#APIKEY").value = API_KEY;
  document.querySelector("#APIMODEL").value = API_MODEL;
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
    await updateConfig();

    let currentTabs = await browser.tabs.query({ active: true });

    document.querySelector("#currentHOST").innerHTML = getHostFromUrl(
      currentTabs[0].url
    );
  })();
}

mainApp();

setTimeout(() => {
  callByTimeOut();
}, 250);

// 儲存資料
async function saveData(key, data) {
  try {
    const obj = {};
    obj[key] = data;
    await browser.storage.local.set(obj);
    console.log(key + " ... save");
  } catch (error) {
    console.log(error);
  }
}

// 讀取資料
async function loadData(key, defaultValue) {
  try {
    const result = await browser.storage.local.get(key);
    const data = result[key];

    if (data === undefined) {
      if (defaultValue === undefined) {
        return "";
      } else {
        return defaultValue;
      }
    }

    return data;
  } catch (error) {
    console.log(error);
    return "";
  }
}
