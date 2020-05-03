const { ipcRenderer } = require("electron");

const originalOpen = window.open;

window.open = function (url, target, features, replace) {
  if (target === "_self") {
    return originalOpen(url, target, features, replace);
  } else if (target !== "_blank") {
    console.log("EveVision intercepting window open", target);

    const windowProxy = {
      closed: false,
    };

    ipcRenderer
      .invoke("external-windowOpen", {
        // eslint-disable-next-line no-restricted-globals
        origin: location.origin,
        url: url,
        target: target,
        features: features,
        replace: replace,
      })
      .then((windowId) => {
        ipcRenderer.once("window-closed-" + windowId, () => {
          console.log("EveVision window " + windowId + " closed");
          //windowProxy.closed = true;
        });
      });
    return windowProxy;
  }
};

window.close = function () {
  console.log("evevision close")
  ipcRenderer.send("external-windowClose");
}

console.log("EveVision preloaded");
