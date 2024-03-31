browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  browser.tabs.sendMessage(sender.tab.id, request);
});
