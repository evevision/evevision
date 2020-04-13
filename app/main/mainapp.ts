import {Menu, protocol, Tray, app} from "electron"
import fs from 'fs';
import path from 'path';
import EveInstance from "./eveinstance";
import {getCharacterIdByName} from "../shared/esi/client"
import store from "./store";
import {updateCharacterAuth} from "../shared/store/characters/actions";
import superagent from 'superagent';
import Overlay from './native';
const log = require('electron-log');
require('../shared/store/characters/actions') // we have to require it directly otherwise it gets cut out by webpack
require('../shared/store/characters/reducers')

//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

export default class MainApp {
    private markQuit = false
    private tray: Electron.Tray | null
    private eveInstances: Map<string, EveInstance>
    private dllPath: string
    private injectedPids: Set<number>
    private scanner: NodeJS.Timeout

    constructor() {
        this.tray = null
        this.eveInstances = new Map()
        this.injectedPids = new Set()

        let dirPath = process.resourcesPath.includes("node_modules") ?
            path.join(process.resourcesPath, "../../../../output/overlay/Release") :  // not a packaged app, get it from actual output folder
            process.resourcesPath // packaged app, read from resources folder

        let tempDllPath = path.join(dirPath, "evevision_overlay.dll");
        let salt = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
        let newDllPath = process.env.APPDATA + "/evevision_overlay_" + salt + ".dll";
        if(fs.existsSync(tempDllPath)) {
            // move the DLL.
            // in development, we do this so the compiler can replace the file without shutting down EVE.
            // in production, it's due to an unknown bug with the packaged app extraction, if you rerun evevision it won't extract the DLL the second time.
            if(!fs.existsSync(newDllPath)) {
                fs.copyFileSync(tempDllPath, newDllPath);
            }
        }
        this.dllPath = newDllPath;
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
        // ESI is disabled for now.
        superagent.post("https://login.eveonline.com/oauth/token")
            .auth("", "")
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
                path.join(app.getAppPath(), 'evevision.ico')
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
                icon: path.join(app.getAppPath(), 'evevision.ico'),
                title: "EveVision is ready"
            })

            app.on('second-instance', (event, commandLine, workingDirectory) => {
                this.tray!.displayBalloon({
                    content: "Just login to EVE! Fly without fear, capsuleer.",
                    iconType: "custom",
                    icon: path.join(app.getAppPath(), 'evevision.ico'),
                    title: "EveVision is already running"
                })
            })
        }
        log.info("Tray setup")
    }

    public quit() {
        this.markQuit = true
        this.stop();
        app.quit();
    }

    public scanForEve() {
        const topWindows = Overlay.getTopWindows();
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

    private injectEveClient(window: Overlay.IWindow) {
        this.injectedPids.add(window.processId)
        return Overlay.injectProcess({...window, dllPath: this.dllPath})
    }

    private initCharacter(characterName: string, id: number) {
        log.info("Character ID found for " + characterName + ":" + id)
        const eveInstance = new EveInstance(characterName, id);
        this.eveInstances.set(characterName, eveInstance);
        eveInstance.start();
    }

    private startEveInstance(characterName: string, window: Overlay.IWindow) {
        this.injectedPids.add(window.processId)

        log.info("Injecting", characterName, window, this.dllPath)

        let result = this.injectEveClient(window)

        if(result.injectSucceed) {
            log.info("Injection successful", characterName)

            const state: any = store.getState();
            if(state && state.characters && state.characters.characters) {
                const cachedChar = state.characters.characters.find(c => c.public.name === characterName)
                if(cachedChar) {
                    log.info("Loaded character ID for '" + characterName + "' from state")
                    this.initCharacter(characterName, cachedChar.id)
                    return;
                }
            }

            getCharacterIdByName(characterName).then((id) => {
                this.initCharacter(characterName, id);
            }).catch((err) => {
                log.error("Error getting character ID for " + characterName, err)
                // not sure what to do here
                // this.injectedPids.delete(window.processId)
            })
        }
    }

}
