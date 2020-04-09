import {Menu, protocol, Tray, app} from "electron"

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

        log.info("Starting MainApp")

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
        log.info("Stopping MainApp")
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

            this.tray.displayBalloon({
                content: "Log into EVE if you haven't already. Fly without fear, capsuleer.",
                iconType: "custom",
                icon: path.join(__dirname, "evevision.ico"),
                title: "EveVision is ready"
            })

            app.on('second-instance', (event, commandLine, workingDirectory) => {
                this.tray!.displayBalloon({
                    content: "Just login to EVE! Fly without fear, capsuleer.",
                    iconType: "custom",
                    icon: path.join(__dirname, "evevision.ico"),
                    title: "EveVision is already running"
                })
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
            if(window.exeName.endsWith("exefile.exe") && window.title.startsWith("EVE - ") && !this.injectedPids.has(window.processId)) {
                const characterName = window.title.replace("EVE - ", "")
                if(this.eveInstances.has(characterName)) {
                    this.eveInstances.get(characterName)!.stop()
                    this.eveInstances.delete(characterName)
                }
                this.startEveInstance(characterName, window)
            }
        })
    }

    private injectEveClient(window: Hooker.IWindow) {
        this.injectedPids.add(window.processId)
        return this.hooker.injectProcess({...window, dllPath: this.dllPath})
    }

    private startEveInstance(characterName: string, window: Hooker.IWindow) {
        this.injectedPids.add(window.processId)

        log.info("Injecting", characterName, window, this.dllPath)

        let result = this.injectEveClient(window)

        if(result.injectSucceed) {
            log.info("Injection successful", characterName)
            getCharacterIdByName(characterName).then((id) => {
                log.info("Character ID found for " + characterName + ":" + id)
                const eveInstance = new EveInstance(characterName, id);
                this.eveInstances.set(characterName, eveInstance);
                eveInstance.start();
            }).catch((err) => {
                log.error("Error getting character ID for " + characterName, err)
                // not sure what to do here
                // this.injectedPids.delete(window.processId)
            })
        }
    }

}
