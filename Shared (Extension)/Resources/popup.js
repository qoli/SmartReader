let button = document.querySelector("#myButton");
button.addEventListener("click", function () {
  sendMessageToContent("runSummary");
});

function sendMessageToContent(message) {
  browser.tabs.query({ active: true }).then(function (currentTabs) {
    if (currentTabs[0].id >= 0) {
      browser.tabs.sendMessage(currentTabs[0].id, message);
    }
  });
}
