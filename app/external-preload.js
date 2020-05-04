const { ipcRenderer } = require("electron");

// Intercept link clicks
function interceptClickEvent(e) {
  const eTarget = e.target || e.srcElement;
  if (eTarget.tagName === "A") {
    const href = eTarget.getAttribute("href");
    const target = eTarget.getAttribute("target");

    if (target == "_blank") {
      e.preventDefault();
      console.log("EveVision intercepting link open", target);
      ipcRenderer.invoke("external-windowOpen", {
        // eslint-disable-next-line no-restricted-globals
        origin: location.origin,
        url: href,
        target: target,
      });
    }
  }
}

//listen for link click events at the document level
if (document.addEventListener) {
  document.addEventListener("click", interceptClickEvent);
} else if (document.attachEvent) {
  document.attachEvent("onclick", interceptClickEvent);
}

// Replace window.open
const originalOpen = window.open;

window.open = function (url, target, features, replace) {
  if (target === "_self") {
    return originalOpen(url, target, features, replace);
  } else {
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
  console.log("evevision close");
  ipcRenderer.send("external-windowClose");
};

console.log("EveVision preloaded");
