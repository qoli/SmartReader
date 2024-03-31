// browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log("Background / Received request: ", request);

//   if (request.mode === "sendReader") {
//     sendResponse({
//       callback: "ok",
//     });
//   }
// });

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 将消息转发给 content.js
  browser.tabs.sendMessage(sender.tab.id, request);
});
