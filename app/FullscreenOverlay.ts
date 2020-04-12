import {BrowserWindow, shell, ipcMain, IpcMainEvent} from "electron";
import Overlay from 'overlay';
import EveInstance from "./eveinstance";
const log = require('electron-log');

export default class FullscreenOverlay {

    public readonly windowId: number
    public readonly webContentsId: number

    private readonly parentInstance: EveInstance

    public electronWindow: BrowserWindow

    private closed: boolean = false

    // note itemId must not be an empty string, it'll mess up arg parsing
    constructor(parentInstance: EveInstance) {
        this.parentInstance = parentInstance

        const options: Electron.BrowserWindowConstructorOptions = {
            height: 100,
            width: 100,
            frame: false,
            show: false,
            transparent: true,
            resizable: true,

            webPreferences: {
                nodeIntegration: true,
                offscreen: true,
                additionalArguments: [this.parentInstance.characterId.toString(), "fullscreenoverlay", "none", "false"],
                webviewTag: false
            }
        }

        this.electronWindow = new BrowserWindow(options)
        this.windowId = this.electronWindow.id;
        this.webContentsId = this.electronWindow.webContents.id;

        this.electronWindow.webContents.frameRate = 60;
        this.electronWindow.setPosition(0, 0)

        this.linkWindowToOverlay()
        this.setupIpc()
        this.hookWindow()
        //this.electronWindow.webContents.openDevTools({mode: 'detach'})

        this.electronWindow.loadURL(`file://${__dirname}/app.html`)
    }

    handleRestoreRequest = (event: IpcMainEvent, windowId: number) => {
        if(event.sender.id == this.webContentsId) {
            this.parentInstance.restoreWindow(windowId);
        }
    }

    handleCloseRequest = (event: IpcMainEvent, windowId: number) => {
        if(event.sender.id == this.webContentsId) {
            this.parentInstance.closeWindow(windowId);
        }
    }

    handleMinimizeAllRequest = (event: IpcMainEvent) => {
        if(event.sender.id == this.webContentsId) {
            console.log("minimizing all")
            this.parentInstance.minimizeAllWindows();
        }
    }

    handleRestoreAllRequest = (event: IpcMainEvent) => {
        if(event.sender.id == this.webContentsId) {
            this.parentInstance.restoreAllWindows();
        }
    }

    setupIpc() {
        ipcMain.on("restoreWindow", this.handleRestoreRequest)
        ipcMain.on("closeMinimizedWindow", this.handleCloseRequest)
        ipcMain.on("minimizeAllWindows", this.handleMinimizeAllRequest)
        ipcMain.on("restoreAllWindows", this.handleRestoreAllRequest)
    }

    resize(width: number, height: number) {
        this.electronWindow.setSize(width, height)
        this.electronWindow.setContentSize(width, height)
    }

    stop() {
        this.closed = true
        this.electronWindow.close()
    }

    focus() {
        this.electronWindow.focusOnWebView()
    }

    blur() {
        this.electronWindow.blurWebView();
    }

    clearHover() {
        this.electronWindow.webContents.executeJavaScript("window.dispatchEvent(new Event('clearHover'));")
    }

    sendInputEvent(inputEvent: any) {
        if(this.closed) { return; }
        this.electronWindow.webContents.sendInputEvent(inputEvent);
    }

    linkWindowToOverlay() {
        Overlay.addWindow(this.parentInstance.characterName, this.windowId, {
            name: "fullscreen-overlay" + "-" + this.windowId,
            resizable: false,
            maxWidth: 3440,
            maxHeight: 1440,
            minWidth: 0,
            minHeight: 0,
            nativeHandle: this.electronWindow.getNativeWindowHandle().readUInt32LE(0),
            rect: {
                width: 1000, height: 1000, x: 0, y: 0
            },
            caption: {
                left: 0,
                right: 0,
                top: 0,
                height: 0
            },
            dragBorderWidth: 0
        })
    }

    private hookWindow() {
        this.electronWindow.webContents.on("new-window", (e, url) => {
            e.preventDefault()
            shell.openExternal(url)
        })

        this.electronWindow.webContents.on(
            "paint",
            (event, dirty: Electron.Rectangle, nativeImage: Electron.NativeImage) => {
                if(this.closed) {return;}

                Overlay.sendFrameBuffer(
                    this.parentInstance.characterName,
                    this.windowId,
                    {buffer: nativeImage.getBitmap(), dirty: dirty, rect: {x: 0, y: 0, width: nativeImage.getSize().width, height: nativeImage.getSize().height}}
                )
            }
        )

        this.electronWindow.on("close", (e) => {
            if(this.closed) {return;}
            this.closed = true;
            console.log("fullscreen overlay closed")
        })

        this.electronWindow.webContents.on("cursor-changed", (event, type) => {
            if(this.closed) {return;}
            let cursor
            switch (type) {
                case "default":
                    cursor = "IDC_ARROW"
                    break
                case "pointer":
                    cursor = "IDC_HAND"
                    break
                case "crosshair":
                    cursor = "IDC_CROSS"
                    break
                case "text":
                    cursor = "IDC_IBEAM"
                    break
                case "wait":
                    cursor = "IDC_WAIT"
                    break
                case "help":
                    cursor = "IDC_HELP"
                    break
                case "move":
                    cursor = "IDC_SIZEALL"
                    break
                case "nwse-resize":
                    cursor = "IDC_SIZENWSE"
                    break
                case "nesw-resize":
                    cursor = "IDC_SIZENESW"
                    break
                case "ns-resize":
                    cursor = "IDC_SIZENS"
                    break
                case "ew-resize":
                    cursor = "IDC_SIZEWE"
                    break
                case "none":
                    cursor = ""
                    break
            }
            if (cursor) {
                try {
                    Overlay.sendCommand(this.parentInstance.characterName, {command: "cursor", cursor})
                } catch(ex) {
                    log.info("Exception setting cursor in fullscreen overlay")
                }
            }
        })
    }

}