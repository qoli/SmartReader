browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(
    "Background / Received request: ",
    request.mode,
    request.currentURL
  );

  if (request.mode === "sendReader") {
    sendResponse({
      callback: "ok",
    });
  }
});
