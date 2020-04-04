import {ipcMain, IpcMainEvent} from "electron";
import ApiClient from "./api/client";
import EveWindow from "./EveWindow";
import Overlay from 'overlay'
import FullscreenOverlay from "./FullscreenOverlay";
export default class EveInstance {

    private characterName: string
    private characterId: number
    private eveWindows: EveWindow[]
    private fullscreenOverlay?: FullscreenOverlay
    private api: ApiClient
    private overlay?: typeof Overlay
    public gameResolution?: {width: number, height: number}

    constructor(characterName: string, characterId: number) {
        this.characterId = characterId
        this.characterName = characterName
        this.eveWindows = []
        this.api = new ApiClient(this.characterId)
    }

    public restoreWindow(windowId: number) {
        const window = this.eveWindows.find(w => w.windowId == windowId)
        if(window) { window.restore(); }
    }

    public restoreAllWindows() {
        this.eveWindows.forEach(w => w.restore())
    }

    public createWindow(windowName: string, itemId: string) {
        if(this.overlay != undefined) {
            const uniqueWindows = ["tools", "auth", "beanwatch", "about", "settings"]

            if(uniqueWindows.includes(windowName)) {
                // make sure we don't have one open already
                const window = this.eveWindows.find(w => w.windowName == windowName)
                if(window) {
                    if(this.fullscreenOverlay) {
                        this.fullscreenOverlay.electronWindow.webContents.send("removeMinimizedWindow",
                            window.windowId
                        )
                    }
                    window.restore();
                    window.focus();
                    return
                }
            }
            const window = new EveWindow(this.characterId, windowName, itemId, windowName !== "welcome", this.overlay, this)
            this.eveWindows.push(window);
        }
    }

    public deleteWindow(windowId: number) {
        // this gets called back by window.close() once its done everything else, although maybe we should just put in closewindow
        this.eveWindows = this.eveWindows.filter(w => w.windowId !== windowId)
    }

    public closeWindow(windowId: number) {
        const window = this.eveWindows.find(w => w.windowId == windowId)
        if(window !== undefined) {
            window.close()
        }
    }

    public minimizeWindow(windowId: number) {
        const window = this.eveWindows.find(w => w.windowId === windowId)
        if(window && this.fullscreenOverlay) {
            if(window.minimize()) {
                this.fullscreenOverlay.electronWindow.webContents.send("addMinimizedWindow",
                    windowId,
                    window.getTitle(),
                    window.isUserClosable
                )
            }
        }
    }

    public minimizeAllWindows() {
        this.eveWindows.forEach(w => this.minimizeWindow(w.windowId));
    }

    public stop() {
        this.api.stop()
        if(this.fullscreenOverlay !== undefined) { this.fullscreenOverlay.stop() }
        this.eveWindows.forEach(window => window.close())
        this.teardownIpc()
    }

    public start() {
        this.overlay = require("overlay")
        this.overlay!.start({characterName: this.characterName})
        this.overlay!.setEventCallback(this.handleOverlayEvent)

        this.setupIpc()
        this.api.start()
    }

    private ready() {
        console.log("ready!")
        this.createWindow("welcome", "none")
        if(this.overlay !== undefined) { this.fullscreenOverlay = new FullscreenOverlay(this.characterId, this.overlay, this); }
    }

    private updateGameResolution(width: number, height: number) {
        let initial = false;
        if(!this.gameResolution) { initial = true; }
        this.gameResolution = {width, height}
        if(initial) {this.ready();} // got our game window, make the welcome screen
        if(this.fullscreenOverlay !== undefined) { this.fullscreenOverlay.resize(width, height) };
        this.eveWindows.forEach(w => w.reposition()); // reposition all the windows
    }

    private handleOverlayEvent = (event: string, payload: any) => {
        if (event === "game.input") {
            const inputEvent = this.overlay!.translateInputEvent(payload) // why is this done by the overlay C++
            let window;
            if(this.fullscreenOverlay && payload.windowId == this.fullscreenOverlay.windowId) {
                window = this.fullscreenOverlay
            } else {
                window = this.eveWindows.find(w => w.windowId == payload.windowId);
            }
            if (window) {
                if (inputEvent) { window.sendInputEvent(inputEvent); }
            }
        } else if (event === "graphics.window.event.resize" || event === "graphics.window") {
            this.updateGameResolution(payload.width, payload.height)
        } else if (event === "game.window.focused") {
            // focusing doesnt work on ingame windows
            this.eveWindows.forEach((window) => {
                if(window.windowId !== payload.focusWindowId) {
                    window.blur()
                }
            })
            if(this.fullscreenOverlay !== undefined) { this.fullscreenOverlay.blur() }
            const focusWin = this.eveWindows.find(w => w.windowId === payload.focusWindowId)
            if (focusWin) {
                focusWin.focus()
            }
        } else if (event === "game.clearhover") {
            this.eveWindows.forEach((window) => {
                window.clearHover();
            })
            if(this.fullscreenOverlay !== undefined) { this.fullscreenOverlay.clearHover() }
        } else if (event === "game.window.boundsrequest") {
            const win = this.eveWindows.find(w => w.windowId === payload.windowId)
            if(win) {
                win.setBounds({size: {width: payload.width as number, height: payload.height as number}, pos: {x: payload.x as number, y: payload.y as number}})
            }
        }
    }

    private setupIpc() {
        // comes from any window
        ipcMain.on("openWindow", this.handleOpenWindowRequest)

        // comes from the window that wants to close/minimize
        ipcMain.on("closeMe", this.handleCloseRequest)
        ipcMain.on("minimizeMe", this.handleMinimizeRequest)
    }

    private teardownIpc() {
        ipcMain.removeListener("openWindow", this.handleOpenWindowRequest)
        ipcMain.removeListener("closeMe", this.handleCloseRequest)
        ipcMain.removeListener("minimizeMe", this.handleMinimizeRequest)
    }

    private handleOpenWindowRequest = (e: IpcMainEvent, windowName: string, itemId: string) => {
        // this event will fire from every EveInstance's windows, make sure it's one of our windows
        if(this.eveWindows.find(w => w.webContentsId == e.sender.id) !== undefined) {
            console.log("open", windowName)
            this.createWindow(windowName, (itemId === "" || itemId == undefined) ? "none" : itemId);
        }
    }

    private handleCloseRequest = (e: IpcMainEvent) => {
        const window = this.eveWindows.find(w => w.webContentsId == e.sender.id)
        if(window) { this.closeWindow(window.windowId )}
    }

    private handleMinimizeRequest = (e: IpcMainEvent) => {
        const window = this.eveWindows.find(w => w.webContentsId == e.sender.id)
        if(window) { this.minimizeWindow(window.windowId )}
    }
}