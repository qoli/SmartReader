function sendMessageToContent(message) {
  browser.tabs.query({ active: true }).then(function (currentTabs) {
    if (currentTabs[0].id >= 0) {
      browser.tabs.sendMessage(currentTabs[0].id, message);
    }
  });
}

document.querySelector("#myButton").addEventListener("click", function () {
  sendMessageToContent("runSummary");
});

document
  .querySelector("#coreContentText")
  .addEventListener("click", function () {
    sendMessageToContent("coreContentText");
  });

document
  .querySelector("#sendNativeMessage")
  .addEventListener("click", function () {
    console.log("111");
  });
