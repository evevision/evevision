import { ipcMain, IpcMainEvent, BrowserWindow } from "electron";
import ApiClient from "./api/client";
import EveWindow from "./EveWindow";
import Overlay from "../native";
import FullscreenOverlay from "./FullscreenOverlay";
import { ExternalToolMeta } from "../shared/externaltool";
import log from "../shared/log";
import MainApp from "./mainapp";

export default class EveInstance {
  public characterName: string;
  public characterId: number;
  private windows: BrowserWindow[];
  public eveWindows: EveWindow[];
  private fullscreenOverlay?: FullscreenOverlay;
  private api: ApiClient;
  public gameResolution?: { width: number; height: number };
  private started?: boolean;
  public app: MainApp;

  constructor(characterName: string, characterId: number, app: MainApp) {
    this.characterId = characterId;
    this.characterName = characterName;
    this.eveWindows = [];
    this.windows = [];
    this.api = new ApiClient(this.characterId);
    this.app = app;
  }

  public restoreWindow(windowId: number) {
    const window = this.eveWindows.find((w) => w.windowId === windowId);
    if (window) {
      window.restore();
    }
  }

  public restoreAllWindows() {
    log.info("Restoring all windows");
    this.eveWindows.forEach((w) => w.restore());
  }

  public createWindow(
    windowName: string,
    itemId: string,
    externalMeta?: ExternalToolMeta,
    parentWindow?: EveWindow
  ): EveWindow {
    const uniqueWindows = [
      "auth",
      "beanwatch",
      "about",
      "settings",
      "jukebox",
      "toolexplorer",
    ];

    if (uniqueWindows.includes(windowName)) {
      // make sure we don't have one open already
      const window = this.eveWindows.find((w) => w.windowName === windowName);
      if (window) {
        log.info("Restoring unique window", windowName);
        if (this.fullscreenOverlay) {
          this.fullscreenOverlay.electronWindow.webContents.send(
            "removeMinimizedWindow",
            window.windowId
          );
        }
        window.restore();
        window.focus();
        return window;
      }
    }
    log.info("Creating window", windowName, itemId);
    const window = new EveWindow(
      this.characterId,
      windowName,
      itemId,
      windowName !== "welcome",
      this,
      externalMeta,
      parentWindow
    );
    this.eveWindows.push(window);
    this.windows.push(window.electronWindow);

    if (windowName === "ricardo" && this.fullscreenOverlay) {
      this.fullscreenOverlay.electronWindow.webContents.send("ricardo", true);
    }

    this.app.registerWindow(window.webContentsId, this);

    return window;
  }

  public deleteWindow(windowId: number) {
    // this gets called back by window.close() once its done everything else, although maybe we should just put in closewindow
    this.eveWindows = this.eveWindows.filter((w) => w.windowId !== windowId);
  }

  public closeWindow(windowId: number) {
    const window = this.eveWindows.find((w) => w.windowId === windowId);
    this._closeWindow(window);
  }

  public closeWindowByWebContentsId(webContentsId: number) {
    const window = this.eveWindows.find(
      (w) => w.webContentsId === webContentsId
    );
    console.log("window?", window);
    this._closeWindow(window);
  }

  private _closeWindow(window: EveWindow) {
    if (window !== undefined) {
      if (window.windowName === "ricardo" && this.fullscreenOverlay) {
        this.fullscreenOverlay.electronWindow.webContents.send(
          "ricardo",
          false
        );
      }
      window.close();
    }
  }

  public minimizeWindow(windowId: number) {
    const window = this.eveWindows.find((w) => w.windowId === windowId);
    if (window && this.fullscreenOverlay) {
      if (window.minimize()) {
        this.fullscreenOverlay.electronWindow.webContents.send(
          "addMinimizedWindow",
          windowId,
          window.getTitle(),
          window.isUserClosable
        );
      }
    }
  }

  public minimizeAllWindows() {
    this.eveWindows.forEach((w) => this.minimizeWindow(w.windowId));
  }

  public stop() {
    if (!this.started) {
      return;
    }
    log.info("Stopping EveInstance", this.characterName);

    //this.api.stop() - ESI disabled
    if (this.fullscreenOverlay !== undefined) {
      this.fullscreenOverlay.stop();
    }
    this.eveWindows.forEach((window) => window.close());
    this.teardownIpc();
    Overlay.stop(this.characterName);
    this.started = false;

    log.info("EveInstance stopped", this.characterName);
  }

  public start() {
    if (this.started) {
      return;
    }
    log.info("Starting EveInstance", this.characterName);
    Overlay.start(this.characterName);
    Overlay.setEventCallback(this.characterName, this.handleOverlayEvent);

    this.setupIpc();
    //this.api.start() - ESI disabled
    this.started = true;
    log.info("EveInstance started", this.characterName);
  }

  private ready() {
    log.info("EveInstance ready", this.characterName);
    this.createWindow("welcome", "none");
    this.fullscreenOverlay = new FullscreenOverlay(this);
  }

  private updateGameResolution(width: number, height: number) {
    if (width === 0 && height === 0) {
      // alt tabbed while fullscreen, probably
      return;
    }
    let initial = false;
    if (!this.gameResolution) {
      initial = true;
    }
    this.gameResolution = { width, height };
    if (initial) {
      this.ready();
    } // got our game window, make the welcome screen
    if (this.fullscreenOverlay !== undefined) {
      this.fullscreenOverlay.resize(width, height);
    }
    this.eveWindows.forEach((w) => w.reposition()); // reposition all the windows
  }

  private handleOverlayEvent = (event: string, payload: any) => {
    if (event === "game.input") {
      const inputEvent = Overlay.translateInputEvent(payload); // TODO: why is input sent to us by the C++ and then sent back to C++ for translation? probably can just move this all into one spot
      if (!inputEvent) {
        return;
      }
      let window;
      if (
        this.fullscreenOverlay &&
        payload.windowId === this.fullscreenOverlay.windowId
      ) {
        this.fullscreenOverlay.sendInputEvent(inputEvent);
      } else {
        window = this.eveWindows.find((w) => w.windowId === payload.windowId);
        if (window) {
          window.sendInputEvent(inputEvent);
          if (payload.msg === 524) {
            // mouse4/5 up
            if (payload.wparam === 131072) {
              // mouse4 up (forward)
              window.goForward();
            } else if (payload.wparam === 65536) {
              //mouse5 up (back)
              window.goBack();
            }
          }
        }
      }
    } else if (
      event === "graphics.window.event.resize" ||
      event === "graphics.window"
    ) {
      this.updateGameResolution(payload.width, payload.height);
    } else if (event === "game.window.focused") {
      // focusing doesnt work on ingame windows
      this.eveWindows.forEach((window) => {
        if (window.windowId !== payload.focusWindowId) {
          window.blur();
        }
      });
      if (this.fullscreenOverlay !== undefined) {
        this.fullscreenOverlay.blur();
      }
      const focusWin = this.eveWindows.find(
        (w) => w.windowId === payload.focusWindowId
      );
      if (focusWin) {
        focusWin.focus();
      }
    } else if (event === "game.clearhover") {
      this.eveWindows.forEach((window) => {
        window.clearHover();
      });
      if (this.fullscreenOverlay !== undefined) {
        this.fullscreenOverlay.clearHover();
      }
    } else if (event === "game.window.boundsrequest") {
      const win = this.eveWindows.find((w) => w.windowId === payload.windowId);
      if (win) {
        win.setBounds({
          size: {
            width: payload.width as number,
            height: payload.height as number,
          },
          pos: { x: payload.x as number, y: payload.y as number },
        });
      }
    } else if (event === "game.exit") {
      log.info("Received game exit", this.characterName);
    } else if (event === "log") {
      log.info("from overlay: " + payload.message);
    }
  };

  private setupIpc() {
    // comes from any window
    ipcMain.on("openWindow", this.handleOpenWindowRequest);
    ipcMain.on("openExternalTool", this.handleOpenExternalToolRequest);

    // comes from the window that wants to close/minimize
    ipcMain.on("closeMe", this.handleCloseRequest);
    ipcMain.on("minimizeMe", this.handleMinimizeRequest);
  }

  private teardownIpc() {
    ipcMain.removeListener("openWindow", this.handleOpenWindowRequest);
    ipcMain.removeListener("closeMe", this.handleCloseRequest);
    ipcMain.removeListener("minimizeMe", this.handleMinimizeRequest);
    ipcMain.removeListener(
      "openExternalTool",
      this.handleOpenExternalToolRequest
    );
  }

  private handleOpenWindowRequest = (
    e: IpcMainEvent,
    windowName: string,
    itemId: string
  ) => {
    if (
      (this.fullscreenOverlay &&
        e.sender.id === this.fullscreenOverlay.electronWindow.webContents.id) ||
      this.eveWindows.find((w) => w.webContentsId === e.sender.id) !== undefined
    ) {
      this.createWindow(
        windowName,
        itemId === "" || itemId === undefined ? "none" : itemId
      );
    }
  };

  private handleOpenExternalToolRequest = (
    e: IpcMainEvent,
    meta: ExternalToolMeta
  ) => {
    if (e.sender.isDestroyed()) {
      return;
    }
    // this event will fire from every EveInstance's windows, make sure it's one of our windows
    if (
      (this.fullscreenOverlay &&
        !this.fullscreenOverlay.electronWindow.isDestroyed() &&
        !this.fullscreenOverlay.electronWindow.webContents.isDestroyed() &&
        e.sender.id === this.fullscreenOverlay.electronWindow.webContents.id) ||
      this.eveWindows.find((w) => w.webContentsId === e.sender.id) !== undefined
    ) {
      this.createWindow("externalsite", meta.url, meta);
    }
  };

  private handleCloseRequest = (e: IpcMainEvent) => {
    const window = this.eveWindows.find((w) => w.webContentsId === e.sender.id);
    if (window) {
      this.closeWindow(window.windowId);
    }
  };

  private handleMinimizeRequest = (e: IpcMainEvent) => {
    const window = this.eveWindows.find((w) => w.webContentsId === e.sender.id);
    if (window) {
      this.minimizeWindow(window.windowId);
    }
  };
}
