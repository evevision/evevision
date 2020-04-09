import {Rect} from "./EveWindow";
import {BrowserWindow, shell} from "electron";
const log = require('electron-log');
import {version} from './package.json';

// Currently only used for displaying external websites
export default class ChildWindow {

    public readonly windowId: number
    public url: string
    private readonly electronWindow: BrowserWindow
    private readonly paintCallback: (dirtyRect: Electron.Rectangle, nativeImage: Electron.NativeImage) => void
    private readonly cursorCallback: (cursor: string) => void
    private readonly titleCallback: (title: string) => void

    constructor(url: string, initialRect: Rect, paintCallback: (dirtyRect: Electron.Rectangle, nativeImage: Electron.NativeImage) => void, cursorCallback: (cursor: string) => void, titleCallback: (title: string) => void) {

        log.info("Creating child window", url)

        this.paintCallback = paintCallback
        this.cursorCallback = cursorCallback
        this.titleCallback = titleCallback
        this.url = url

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
                contextIsolation: true,
                enableRemoteModule: false,
                sandbox: true,
                webgl: false,
                nodeIntegration: false,
                devTools: true,
                offscreen: true
            }
        }

        this.electronWindow = new BrowserWindow(options)
        this.windowId = this.electronWindow.id;
        this.electronWindow.webContents.frameRate = 60;

        this.hookWindow()

        this.electronWindow.loadURL(url)
        //this.electronWindow.webContents.openDevTools({mode: 'detach'})
    }

    sendInputEvent(inputEvent: any): void {
        this.electronWindow.webContents.sendInputEvent(inputEvent)
    }

    blur(): void {
        this.electronWindow.blurWebView();
        //getWebContents().executeJavaScript("document.activeElement.blur()");
    }

    close(): void {
        log.info("Closing child window")
        this.electronWindow.close()
    }

    destroy(): void {
        this.electronWindow.destroy()
    }

    resize(width: number, height: number): void {
        this.electronWindow.setSize(width, height)
        this.electronWindow.setContentSize(width, height)
    }

    private hookWindow() {

        this.electronWindow.webContents.on("page-title-updated", (e, title) => {
            this.titleCallback(title)
        })

        this.electronWindow.webContents.on("new-window", (e, url) => {
            e.preventDefault()
            shell.openExternal(url)
        })

        this.electronWindow.webContents.on("did-finish-load", () => {
            this.electronWindow.webContents.insertCSS("::-webkit-scrollbar-track{-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);background-color: transparent;}::-webkit-scrollbar{width: 6px;background-color: $panel-background;}::-webkit-scrollbar-thumb{background-color: $button-color;box-shadow: inset 0 0 2x $inner-glow;};::-webkit-scrollbar-thumb:hover{background-color: $button-color-active;box-shadow: inset 0 0 2x $inner-glow;}")
        })

        this.electronWindow.webContents.on(
            "paint",
            (event, dirtyRect: Electron.Rectangle, nativeImage: Electron.NativeImage) => {
                this.paintCallback(dirtyRect, nativeImage);
            }
        )

        this.electronWindow.webContents.on("cursor-changed", (event, type) => {
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
                this.cursorCallback(cursor)
            }
        })
    }

}