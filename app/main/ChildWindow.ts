import EveWindow, { Rect } from "./EveWindow";
import { BrowserWindow } from "electron";
import * as URL from "url";
import log from "../shared/log";
import path from "path";
import { ExternalToolMeta } from "../shared/externaltool";
import EveInstance from "./eveinstance";

// official CCP sites
const secureHosts = [
  "eveonline.com",
  "secure.eveonline.com",
  "login.eveonline.com",
  "www.eveonline.com",
  "forums.eveonline.com",
  "support.eveonline.com",
  "updates.eveonline.com",
  "developers.eveonline.com",
  "ccpgames.com",
  "www.ccpgames.com",
  "store.eve.com",
  "eveonline-merchandise-store.myshopify.com",
];

// Currently only used for displaying external websites
export default class ChildWindow {
  public readonly windowId: number;
  public url: string;
  public title?: string;
  public secure?: boolean;
  public webContentsId: number;
  public readonly electronWindow: BrowserWindow;

  private readonly hideScrollbars: boolean;
  private readonly paintCallback: (
    dirtyRect: Electron.Rectangle,
    nativeImage: Electron.NativeImage
  ) => void;
  private readonly cursorCallback: (cursor: string) => void;
  private readonly titleCallback: (title: string) => void;
  private readonly secureCallback: (secure: boolean) => void;
  private readonly closeCallback: () => void;
  private readonly parentInstance: EveInstance;

  // ok seriously these callbacks are getting dumb, i need to change this
  constructor(
    url: string,
    initialRect: Rect,
    hideScrollbars: boolean,
    paintCallback: (
      dirtyRect: Electron.Rectangle,
      nativeImage: Electron.NativeImage
    ) => void,
    cursorCallback: (cursor: string) => void,
    titleCallback: (title: string) => void,
    secureCallback: (secure: boolean) => void,
    closeCallback: () => void,
    parentInstance: EveInstance,
  ) {
    log.info("Creating child window", url);

    this.paintCallback = paintCallback;
    this.cursorCallback = cursorCallback;
    this.titleCallback = titleCallback;
    this.secureCallback = secureCallback;
    this.closeCallback = closeCallback;
    this.hideScrollbars = hideScrollbars;
    this.url = url;
    this.parentInstance = parentInstance;

    const options: Electron.BrowserWindowConstructorOptions = {
      height: initialRect.size.height,
      width: initialRect.size.width,
      frame: false,
      show: false,
      transparent: false,
      resizable: true,

      webPreferences: {
        backgroundThrottling: false,
        disableHtmlFullscreenWindowResize: true,
        contextIsolation: false, // have to disable this so the window can call ipcRenderer for various stuff
        enableRemoteModule: false,
        sandbox: true,
        webgl: false,
        nodeIntegration: false,
        devTools: true,
        offscreen: true,
        disableDialogs: true,
        preload: path.resolve(__dirname, "..", "external-preload.js"),
      },
    };

    this.electronWindow = new BrowserWindow(options);
    this.windowId = this.electronWindow.id;
    this.webContentsId = this.electronWindow.webContents.id;

    this.electronWindow.webContents.frameRate = 60;

    this.hookWindow();

    this.electronWindow.loadURL(url);
    if (process.env.NODE_ENV !== "production") {
      this.electronWindow.webContents.openDevTools({ mode: "detach" });
    }

    this.parentInstance.app.registerWindow(
      this.webContentsId,
      this.parentInstance
    );
  }

  goBack(): void {
    if (this.electronWindow.webContents.canGoBack()) {
      this.electronWindow.webContents.goBack();
      this.setSecure(false); // TODO: find out if the back page is secure
    }
  }

  goForward(): void {
    if (this.electronWindow.webContents.canGoForward()) {
      this.electronWindow.webContents.goForward();
      this.setSecure(false); // TODO: find out if the forward page is secure
    }
  }

  sendInputEvent(inputEvent: any): void {
    if(inputEvent.type == "keyDown" && inputEvent.modifiers.includes("control") && inputEvent.modifiers.length == 1 && inputEvent.keyCode == "R") {
      // CTRL+R
      this.electronWindow.webContents.reload();
      log.info("User requested page reload");
    } else if(inputEvent.type == "keyDown" && inputEvent.modifiers.includes("control") && inputEvent.modifiers.includes("shift") && inputEvent.modifiers.length == 2 && inputEvent.keyCode == "R") {
      // CTRL+SHIFT+R
      this.electronWindow.webContents.reloadIgnoringCache();
      log.info("User requested page reload ignoring cache");
    } else if(inputEvent.type == "keyDown" && inputEvent.modifiers.includes("alt") && inputEvent.modifiers.length == 1 && inputEvent.keyCode == "Left") {
      // Alt + Left Arrow
      if(this.electronWindow.webContents.canGoBack()) {
        this.electronWindow.webContents.goBack();
        log.info("User requested page back");
      }
    } else if(inputEvent.type == "keyDown" && inputEvent.modifiers.includes("alt") && inputEvent.modifiers.length == 1 && inputEvent.keyCode == "Right") {
      // Alt + Right Arrow
      if(this.electronWindow.webContents.canGoForward()) {
        this.electronWindow.webContents.goForward();
        log.info("User requested page forward");
      }
    }
    this.electronWindow.webContents.sendInputEvent(inputEvent);
  }

  blur(): void {
    this.electronWindow.blurWebView();
    //getWebContents().executeJavaScript("document.activeElement.blur()");
  }

  close(): void {
    log.info("Closing child window");
    this.electronWindow.close();
  }

  destroy(): void {
    this.electronWindow.destroy();
  }

  resize(width: number, height: number): void {
    this.electronWindow.setSize(width, height);
    this.electronWindow.setContentSize(width, height);
  }

  setTitle(title: string): void {
    this.title = title;
    this.updateTitle();
  }

  updateTitle(): void {
    this.titleCallback(
      this.title + (this.secure ? " (Verified CCP Website)" : "")
    );
  }

  setSecure(secure: boolean): void {
    this.secureCallback(secure);
    this.secure = secure;
    this.updateTitle();
  }

  private hookWindow() {

    this.electronWindow.on("close", (e) => {
      try {
        this.closeCallback();
      } catch (ex) {
        log.error(
            "Exception closing overlay window",
            this.windowName,
            this.windowId,
            ex
        );
        return;
      }
    });

    this.electronWindow.webContents.on("will-navigate", (_e, url) => {
      let parsed = URL.parse(url);
      if (parsed.hostname && secureHosts.includes(parsed.hostname)) {
        this.setSecure(true);
      } else {
        this.setSecure(false);
      }
    });

    this.electronWindow.webContents.on(
      "will-redirect",
      (_e, url, _isInPlace, isMainFrame, _frameProcessId, _frameRoutingId) => {
        if (isMainFrame) {
          let parsed = URL.parse(url);
          if (parsed.hostname && secureHosts.includes(parsed.hostname)) {
            this.setSecure(true);
          } else {
            this.setSecure(false);
          }
        }
      }
    );

    this.electronWindow.webContents.on("page-title-updated", (_e, title) => {
      if (title.includes("Verified CCP Website")) {
        // somebody is being bad, get them out of there
        // TODO: improve this check
        this.electronWindow.webContents.loadURL("about:blank");
      }
      this.setTitle(title.substr(0, 100));
    });

    this.electronWindow.webContents.on("new-window", (e, url) => {
      // This should never happen anyways.
      e.preventDefault();
    });

    this.electronWindow.webContents.on("did-finish-load", () => {
      if(!this.electronWindow.isDestroyed() && !this.electronWindow.webContents.isDestroyed()) {
        // the page could potentially be destroyed if it immediately calls window.close(), for example evemarketer's login popup
        if (this.hideScrollbars) {
          this.electronWindow.webContents.insertCSS(
              "::-webkit-scrollbar{display:none;}"
          );
        } else {
          this.electronWindow.webContents.insertCSS(
              "::-webkit-scrollbar-track{-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);background-color: transparent;}::-webkit-scrollbar{width: 6px;background-color: $panel-background;}::-webkit-scrollbar-thumb{background-color: $button-color;box-shadow: inset 0 0 2x $inner-glow;};::-webkit-scrollbar-thumb:hover{background-color: $button-color-active;box-shadow: inset 0 0 2x $inner-glow;}"
          );
        }
      }
    });

    this.electronWindow.webContents.on(
      "paint",
      (
        _event,
        dirtyRect: Electron.Rectangle,
        nativeImage: Electron.NativeImage
      ) => {
        this.paintCallback(dirtyRect, nativeImage);
      }
    );

    this.electronWindow.webContents.on("cursor-changed", (_event, type) => {
      let cursor;
      switch (type) {
        case "default":
          cursor = "IDC_ARROW";
          break;
        case "pointer":
          cursor = "IDC_HAND";
          break;
        case "crosshair":
          cursor = "IDC_CROSS";
          break;
        case "text":
          cursor = "IDC_IBEAM";
          break;
        case "wait":
          cursor = "IDC_WAIT";
          break;
        case "help":
          cursor = "IDC_HELP";
          break;
        case "move":
          cursor = "IDC_SIZEALL";
          break;
        case "nwse-resize":
          cursor = "IDC_SIZENWSE";
          break;
        case "nesw-resize":
          cursor = "IDC_SIZENESW";
          break;
        case "ns-resize":
          cursor = "IDC_SIZENS";
          break;
        case "ew-resize":
          cursor = "IDC_SIZEWE";
          break;
        case "none":
          cursor = "";
          break;
      }
      if (cursor) {
        this.cursorCallback(cursor);
      }
    });
  }
}
