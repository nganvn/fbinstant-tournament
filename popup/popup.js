chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  chrome.tabs.sendMessage(
    tabs[0].id,
    {
      url: chrome.extension.getURL("images/stars.jpeg"),
      imageDivId: `${generateObjectId()}`,
      tabId: tabs[0].id
    },
    function(response) {
      console.log("message with url sent");
      window.close();
    }
  );

});
