import {BrowserWindow, Menu, protocol, Tray, app} from "electron"
import {shell} from 'electron';

import path from 'path';
import Hooker from 'hooker';
import EveInstance from "./eveinstance";
import {getCharacterIdByName} from "./esi/client"
const log = require('electron-log');
import store from "./store/main";
import {updateCharacterAuth} from "./store/characters/actions";
import superagent from 'superagent';

require('./store/characters/actions') // we have to require it directly otherwise it gets cut out
require('./store/characters/reducers') // do dis fix it?

//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

export default class MainApp {
    private markQuit = false
    private hooker: typeof Hooker
    private tray: Electron.Tray | null
    private mainWindow: Electron.BrowserWindow | null
    private eveInstances: Map<string, EveInstance>
    private dllPath: string
    private injectedPids: Set<number>
    private scanner: NodeJS.Timeout

    constructor() {
        this.tray = null
        this.mainWindow = null
        this.hooker = require("hooker")
        this.eveInstances = new Map()
        this.injectedPids = new Set()

        let dirPath = process.resourcesPath
        if(dirPath.includes("node_modules")) {
            // we're not inside an electron-builder packaged app, get back
            dirPath = path.join(dirPath, "../../../../../build");
        }
        this.dllPath = path.join(dirPath, "evevision_overlay.dll");

    }

    public start() {

        if(!this.scanner) {
            this.scanner = setInterval(() => {
                this.scanForEve()
            }, 1000);
        }

        /*
        installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => log.info(`Added Extension:  ${name}`))
            .catch((err) => log.info('An error occurred: ', err));
        */

        this.hookLocalEveAuth();
        //this.createMainWindow();
        this.setupSystemTray();
    }

    handleLocalEveAuth = (request, callback) => {
        const authCode = request.url.substr(33)
        console.log("Eve ESI auth code intercepted", authCode);
        // The auth tokens are here on purpose. I want most ESI calls run from the local machine and that requires having
        // the keys locally. Can't do anything with this without another character's secret key anyways.
        superagent.post("https://login.eveonline.com/oauth/token")
            .auth("98de84087ae042c9aaca2ce0491e1e92", "t7fLccg2KmZVDWbTzvxgOz45P2E0bfHRS64leOJX")
            .send({grant_type: 'authorization_code', code: authCode})
            .then((success) => {
                const accessToken = success.body.access_token
                const refreshToken = success.body.refresh_token
                // got an access token/refresh token now. get the character ID.
                superagent.get("https://login.eveonline.com/oauth/verify").auth(accessToken, {type: 'bearer'}).then(
                    (success2) => {
                        const characterId = Number(success2.body.CharacterID)
                        const expiresAt = new Date(success2.body.ExpiresOn + "Z").getTime()
                        // notify the store
                        store.dispatch(updateCharacterAuth({accessToken, refreshToken, expiresAt}, characterId))
                    },
                    (error) => {
                        console.error("Error verifying oauth token", error)
                    }
                )
            }, (error) => {
                console.error("Error getting oauth token", error)
            })
    }

    public hookLocalEveAuth() {
        protocol.registerStringProtocol('eveauth-evevision', this.handleLocalEveAuth)
    }

    public stop() {
        clearInterval(this.scanner)
        this.eveInstances.forEach(instance => instance.stop())
    }

    public setupSystemTray() {
        if (!this.tray) {
            this.tray = new Tray(
                path.join(__dirname, "evevision.ico")
            )
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: "Quit",
                    click: () => {
                        this.quit()
                    }
                }
            ])
            this.tray.setToolTip("EveVision is now running")
            this.tray.setContextMenu(contextMenu)

            this.tray.on("click", () => {
                this.showMainWindow()
            })

            this.tray.displayBalloon({
                content: "Log into EVE if you haven't already. Fly without fear, capsuleer.",
                iconType: "custom",
                icon: path.join(__dirname, "evevision.ico"),
                title: "EveVision is ready"
            })
        }
    }

    public quit() {
        this.markQuit = true
        this.stop();
        app.quit();
    }

    public scanForEve() {
        const topWindows = this.hooker.getTopWindows();
        topWindows.forEach(window => {
            if(window.exeName.endsWith("exefile.exe") && window.title.startsWith("EVE - ")) {
                const characterName = window.title.replace("EVE - ", "")
                if(!this.eveInstances.has(characterName) && !this.injectedPids.has(window.processId)) {
                    // haven't injected this before
                    this.startEveInstance(characterName, window)
                } else {
                    // we already injected this character before. make sure this isn't a process we already injected
                    if(!this.injectedPids.has(window.processId)) {
                        // this is a new process. must've relogged.
                        // we can just reinject, everything else will reconnect automatically
                        this.injectEveClient(window)
                    }
                }
            }
        })
        // TODO: add 'shutdown overview when game exits' option. for now we don't.
    }

    private injectEveClient(window: Hooker.IWindow) {
        console.log("Injecting..")
        this.injectedPids.add(window.processId)
        return this.hooker.injectProcess({...window, dllPath: this.dllPath})
    }

    private startEveInstance(characterName: string, window: Hooker.IWindow) {
        this.injectedPids.add(window.processId)

        log.info("Starting EveVision for " + characterName, window)

        let result = this.injectEveClient(window)

        if(result.injectSucceed) {
            getCharacterIdByName(characterName).then((id) => {
                log.info("Character ID found for " + characterName + ":" + id)
                const eveInstance = new EveInstance(characterName, id);
                this.eveInstances.set(characterName, eveInstance);
                eveInstance.start();
            }).catch((err) => {
                log.error("Error getting character ID for " + characterName, err)
                this.injectedPids.delete(window.processId)
            })
        }
    }

    private createMainWindow() {
        const options: Electron.BrowserWindowConstructorOptions = {
          show: false,
          width: 300,
          height: 450,
          frame: false,
          webPreferences: {
            nodeIntegration: true,
            additionalArguments: ["0", "main", "none", "true"],
            devTools: true,
            webviewTag: true
          }
        }
        const window = new BrowserWindow(options)

        window.webContents.on("new-window", (e, url) => {
            e.preventDefault()
            shell.openExternal(url)
        })

        window.on("close", (event) => {
            if (this.markQuit) {
                return
            }
            event.preventDefault()
            window.hide()
            return false
        })
        window.on("ready-to-show", () => {
            this.showMainWindow()
        })

        window.loadURL(`file://${__dirname}/app.html`)

        //window.webContents.openDevTools({ mode: 'detach' })

        this.mainWindow = window
    }

    private showMainWindow() {
        if(this.mainWindow) {
            this.mainWindow.show()
            this.mainWindow.focus()
        }
    }

}
