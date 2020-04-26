import {
  Menu,
  protocol,
  Tray,
  app,
  IpcMainInvokeEvent,
  ipcMain,
  BrowserWindow
} from "electron";
import fs from "fs";
import path from "path";
import EveInstance from "./eveinstance";
import { getCharacterIdByName } from "../shared/esi/client";
import store from "./store";
import { updateCharacterAuth } from "../shared/store/characters/actions";
import superagent from "superagent";
import Overlay from "../native";
import { default as websiteLogo } from "website-logo";
import { version } from "../package.json";
import rimraf from "rimraf";
import log from "../shared/log";
require("../shared/store/characters/actions"); // we have to require it directly otherwise it gets cut out by webpack
require("../shared/store/characters/reducers");

//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

export default class MainApp {
  private markQuit = false;
  private tray: Electron.Tray | null;
  private eveInstances: Map<string, EveInstance>;
  private dllPath: string;
  private injectedPids: Set<number>;
  private scanner?: NodeJS.Timeout;

  // used in CICD
  private didOverlayLoad: boolean = false;
  private didWelcomeLoad: boolean = false;

  constructor() {
    this.tray = null;
    this.eveInstances = new Map();
    this.injectedPids = new Set();

    let dirPath = process.resourcesPath.includes("node_modules")
      ? path.join(process.resourcesPath, "../../../../output/overlay/Release") // not a packaged app, get it from actual output folder
      : process.resourcesPath; // packaged app, read from resources folder

    try {
      // delete old DLLs if they aren't already open inside EVE
      rimraf.sync(process.env.APPDATA + "\\evevision_overlay_**");
    } catch (ex) {}

    let tempDllPath = path.join(dirPath, "evevision_overlay.dll");
    let salt =
      Math.random()
        .toString(36)
        .substring(2, 6) +
      Math.random()
        .toString(36)
        .substring(2, 6);
    let newDllPath =
      process.env.APPDATA + "/evevision_overlay_" + salt + ".dll";
    if (fs.existsSync(tempDllPath)) {
      // move the DLL.
      // in development, we do this so the compiler can replace the file without shutting down EVE.
      // in production, it's due to an unknown bug with the packaged app extraction, if you rerun evevision it won't extract the DLL the second time.
      if (!fs.existsSync(newDllPath)) {
        fs.copyFileSync(tempDllPath, newDllPath);
      }
    }
    this.dllPath = newDllPath;
  }

  public test() {
    // This is run by the CICD system

    const welcomeOptions: Electron.BrowserWindowConstructorOptions = {
      height: 500,
      width: 500,
      frame: false,
      show: true,
      resizable: true,
      webPreferences: {
        nodeIntegration: true,
        webviewTag: false,
        additionalArguments: ["2116631148", "welcome", "none", "false"]
      }
    };

    const fsoOptions: Electron.BrowserWindowConstructorOptions = {
      height: 1000,
      width: 1000,
      frame: false,
      show: true,
      resizable: true,
      webPreferences: {
        nodeIntegration: true,
        additionalArguments: [
          "2116631148",
          "fullscreenoverlay",
          "none",
          "false"
        ],
        webviewTag: false
      }
    };

    const welcomeWindow = new BrowserWindow(welcomeOptions);
    const fsoWindow = new BrowserWindow(fsoOptions);

    const checkLoads = () => {
      if (this.didWelcomeLoad && this.didOverlayLoad) {
        log.info("CICD test successful");
        setImmediate(() => this.quit()); // for some reason calling it in this event loop causes a segfault
      }
    };

    welcomeWindow.webContents.on("did-finish-load", () => {
      log.info("Welcome window loaded");
      this.didWelcomeLoad = true;
      checkLoads();
    });

    fsoWindow.webContents.on("did-finish-load", () => {
      log.info("Overlay loaded");
      this.didOverlayLoad = true;
      checkLoads();
    });

    welcomeWindow.loadURL(
      `file://${path.resolve(__dirname, "..", "renderer", "app.html")}`
    );

    fsoWindow.loadURL(
      `file://${path.resolve(__dirname, "..", "renderer", "app.html")}`
    );

    log.info("Finished initializing CICD test");
  }

  public start() {
    log.info("Starting MainApp");

    if (!this.scanner) {
      this.scanner = setInterval(() => {
        this.scanForEve();
      }, 1000);
    }

    this.hookLocalEveAuth();
    this.setupSystemTray();
    this.setupIpc();

    if (process.env.CICD === "true" || process.argv[1] === "CICD") {
      log.info("CICD detected. Running test.");
      this.test();
      setTimeout(() => {
        log.error("CICD test failed, took too long to initialize.");
        process.exitCode = 1337;
        this.quit();
      }, 60000);
    }
  }

  handleLocalEveAuth = (request: any, _callback: any) => {
    const authCode = request.url.substr(33);
    console.log("Eve ESI auth code intercepted", authCode);
    // ESI is disabled for now.
    superagent
      .post("https://login.eveonline.com/oauth/token")
      .auth("", "")
      .send({ grant_type: "authorization_code", code: authCode })
      .then(
        success => {
          const accessToken = success.body.access_token;
          const refreshToken = success.body.refresh_token;
          // got an access token/refresh token now. get the character ID.
          superagent
            .get("https://login.eveonline.com/oauth/verify")
            .auth(accessToken, { type: "bearer" })
            .then(
              success2 => {
                const characterId = Number(success2.body.CharacterID);
                const expiresAt = new Date(
                  success2.body.ExpiresOn + "Z"
                ).getTime();
                // notify the store
                store.dispatch(
                  updateCharacterAuth(
                    { accessToken, refreshToken, expiresAt },
                    characterId
                  )
                );
              },
              error => {
                console.error("Error verifying oauth token", error);
              }
            );
        },
        error => {
          console.error("Error getting oauth token", error);
        }
      );
  };

  public hookLocalEveAuth() {
    protocol.registerStringProtocol(
      "eveauth-evevision",
      this.handleLocalEveAuth
    );
  }

  public stop() {
    log.info("Stopping MainApp");
    if (this.scanner) {
      clearInterval(this.scanner);
    }
    this.eveInstances.forEach(instance => instance.stop());
  }

  public setupIpc() {
    ipcMain.handle(
      "resolveFavIcon",
      async (event: IpcMainInvokeEvent, url: string): Promise<string> => {
        let newUrl = "https://eveonline.com/favicon.ico";
        return new Promise((resolve, reject) => {
          websiteLogo(url, (err, info) => {
            if (err) {
              log.error("Error retrieving favicon for", url, err);
              const purl = new URL(url);
              newUrl = purl.protocol + "//" + purl.host + "/favicon.ico";
              resolve(newUrl);
            } else {
              if (info.icon && info.icon.href) {
                resolve(info.icon.href);
              } else {
                const purl = new URL(url);
                newUrl = purl.protocol + "//" + purl.host + "/favicon.ico";
                resolve(newUrl);
              }
            }
          });
        });
      }
    );
  }

  public setupSystemTray() {
    const devPath = path.resolve(__dirname, "evevision.ico");
    const prodPath = path.resolve(__dirname, "..", "evevision.ico");
    let iconPath: string;
    if (fs.existsSync(devPath)) {
      iconPath = devPath;
    } else if (fs.existsSync(prodPath)) {
      iconPath = prodPath;
    }
    if (!this.tray) {
      this.tray = new Tray(iconPath);
      const contextMenu = Menu.buildFromTemplate([
        {
          label: "Quit",
          click: () => {
            this.quit();
          }
        }
      ]);
      this.tray.setToolTip("EveVision  " + version + " is running");
      this.tray.setContextMenu(contextMenu);

      this.tray.displayBalloon({
        content:
          "Log into EVE if you haven't already. Fly without fear, capsuleer.",
        iconType: "custom",
        icon: iconPath,
        title: "EveVision " + version + " is ready"
      });

      app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
        this.tray!.displayBalloon({
          content: "Just login to EVE! Fly without fear, capsuleer.",
          iconType: "custom",
          icon: iconPath,
          title: "EveVision is already running"
        });
      });
    }
    log.info("Tray setup");
  }

  public quit() {
    this.markQuit = true;
    this.stop();
    app.quit();
  }

  public scanForEve() {
    const topWindows = Overlay.getTopWindows();
    topWindows.forEach((window: any) => {
      if (
        window.exeName.endsWith("exefile.exe") &&
        window.title.startsWith("EVE - ") &&
        !this.injectedPids.has(window.processId)
      ) {
        const characterName = window.title.replace("EVE - ", "");
        if (this.eveInstances.has(characterName)) {
          this.eveInstances.get(characterName)!.stop();
          this.eveInstances.delete(characterName);
        }
        this.startEveInstance(characterName, window);
      }
    });
  }

  private injectEveClient(window: Overlay.IWindow) {
    this.injectedPids.add(window.processId);
    return Overlay.injectProcess({ ...window, dllPath: this.dllPath });
  }

  private initCharacter(characterName: string, id: number) {
    log.info("Character ID found for " + characterName + ":" + id);
    const eveInstance = new EveInstance(characterName, id);
    this.eveInstances.set(characterName, eveInstance);
    eveInstance.start();
  }

  private startEveInstance(characterName: string, window: Overlay.IWindow) {
    this.injectedPids.add(window.processId);

    log.info("Injecting", characterName, window, this.dllPath);

    let result = this.injectEveClient(window);

    if (result.injectSucceed) {
      log.info("Injection successful", characterName);

      const state: any = store.getState();
      if (state && state.characters && state.characters.characters) {
        const cachedChar = state.characters.characters.find(
          (c: any) => c.public.name === characterName
        );
        if (cachedChar) {
          log.info(
            "Loaded character ID for '" + characterName + "' from state"
          );
          this.initCharacter(characterName, cachedChar.id);
          return;
        }
      }

      getCharacterIdByName(characterName)
        .then(id => {
          if (typeof id !== "number") {
            throw id;
          }
          this.initCharacter(characterName, id);
        })
        .catch(err => {
          log.error("Error getting character ID for " + characterName, err);
          // not sure what to do here
          // this.injectedPids.delete(window.processId)
        });
    }
  }
}
