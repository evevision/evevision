import {BrowserWindow, ipcMain, shell, IpcMainEvent} from "electron";
import ChildWindow from "./ChildWindow";
import EveInstance from "./eveinstance";
import Overlay, {IFrameBuffer} from 'overlay';
import Store from "electron-store"
const log = require('electron-log');

const positionStore = new Store({name: "window-positions"})

ipcMain.on("clearPositionStore", () => positionStore.clear())

// TODO: do this elsewhere
const defaultSizes = {
    "main":         {width: 600, height: 345},
    "welcome":      {width: 410, height: 170},
    "about":        {width: 600, height: 500},
    "beanwatch":    {width: 400, height: 150},
    "settings":     {width: 400, height: 185},
    "tools":        {width: 375, height: 400},
    "auth":         {width: 400, height: 500},
    "externalsite": {width: 600, height: 500},
    "ricardo":      {width: 1250, height: 750}
}

const dragBorder = 5;
const captionHeight = 20;
const windowSnapBorder = 20; // TODO: figure this out. left side is larger than the rest. normally 18.

export interface Size {
    width: number,
    height: number,
}

export interface Pos {
    x: number,
    y: number
}

export interface Rect {
    size: Size,
    pos: Pos
}

export interface StoredWindowPosition {
    // Distance from edges. Absolutely positioned for snapping.
    left?: number,
    top?: number
    right?: number,
    bottom?: number,
    // Ratio of game resolution.
    xRatio?: number, // or left/right
    yRatio?: number, // or top/bottom
    // Width/height of iwndow
    width: number,
    height: number
}

export default class EveWindow {

    public readonly windowId: number
    public readonly webContentsId: number
    public readonly windowName: string
    public readonly itemId: string
    public readonly isUserClosable: boolean
    public readonly isResizable: boolean
    public readonly windowHash: string

    private readonly parentInstance: EveInstance
    private readonly characterId: number

    private electronWindow: BrowserWindow

    private lastImage?: IFrameBuffer
    private lastChildImage?: IFrameBuffer

    private childRect?: Rect
    private childWindow?: ChildWindow

    private closed: boolean = false
    private minimized: boolean = false
    private preMinimizeRect?: Rect
    private childWindowFocused: boolean = false

    private positionSaveInterval: NodeJS.Timeout
    private hasUnsavedBounds: boolean = false // if we have changed bounds and have not saved it

    constructor(characterId: number, windowName: string, itemId: string, isUserClosable: boolean, parentInstance: EveInstance) {
        this.parentInstance = parentInstance
        this.characterId = characterId
        this.windowName = windowName
        this.itemId = itemId
        this.isUserClosable = isUserClosable
        this.isResizable = this.windowName !== "welcome" && this.windowName !== "about";

        const uniqueArgs = [this.characterId.toString(), this.windowName, Buffer.from(this.itemId).toString("base64")]
        this.windowHash = Buffer.from(uniqueArgs.toString()).toString("base64")

        const args = [...uniqueArgs, this.isUserClosable.toString()]
        const initialRect = this.calculateWindowRect();

        const options: Electron.BrowserWindowConstructorOptions = {
            height: initialRect.height,
            width: initialRect.width,
            frame: false,
            show: false,
            transparent: true,
            resizable: this.isResizable,
            webPreferences: {
                nodeIntegration: true,
                offscreen: true,
                additionalArguments: args,
                webviewTag: false
            }
        }

        this.electronWindow = new BrowserWindow(options)
        this.windowId = this.electronWindow.id;
        this.webContentsId = this.electronWindow.webContents.id;

        this.electronWindow.webContents.frameRate = 60;

        this.electronWindow.setPosition(initialRect.x, initialRect.y)

        this.linkWindowToOverlay()
        this.hookWindow()
        this.setupIpc()

        //if(windowName == "beanwatch") { // only interested in devving beanwatch rn
        //this.electronWindow.webContents.openDevTools({mode: 'detach'})
        //}
        this.electronWindow.loadURL(`file://${__dirname}/app.html`)

        this.positionSaveInterval = setInterval(this.updatePositionStore, 1000)
    }

    public getTitle(): string {
        return this.electronWindow.webContents.getTitle()
    }

    updatePositionStore = () => {

        if(!this.closed && !this.minimized && this.hasUnsavedBounds && this.parentInstance.gameResolution) {
            const bounds = this.electronWindow.getBounds()
            const resolution = this.parentInstance.gameResolution

            // calculate distance from edges
            const top = bounds.y;
            const left = bounds.x;
            const bottom = resolution.height - top - bounds.height;
            const right = resolution.width - left - bounds.width;

            let storedPosition = {width: bounds.width, height: bounds.height} as StoredWindowPosition;

            if(top <= windowSnapBorder) {
                storedPosition.top = top;
            } else if(bottom <= windowSnapBorder) {
                storedPosition.bottom = bottom;
            } else {
                const halfHeight = (resolution.height / 2)
                storedPosition.yRatio = ((top + (bounds.height / 2)) - halfHeight) / halfHeight
            }

            if(left <= windowSnapBorder) {
                storedPosition.left = left;
            } else if(right <= windowSnapBorder) {
                storedPosition.right = right;
            } else {
                const halfWidth = (resolution.width / 2)
                storedPosition.xRatio = ((left + (bounds.width / 2)) - halfWidth) / halfWidth
            }

            positionStore.set(this.windowHash, storedPosition)
            this.hasUnsavedBounds = false
        }
    }

    // called when the game window resizes
    public reposition() {
        if(this.minimized || this.closed) { return; }
        // we already store our current position so this function can recalculate for us
        const rect = this.calculateWindowRect();
        this.setPosition(rect.x, rect.y);
    }

    close() {
        this.updatePositionStore(); // do this BEFORE closing the window

        this.closed = true
        this.teardownIpc()
        this.electronWindow.close()
        if(this.childWindow !== undefined) {
            this.closeChildWindow();
        }

        this.parentInstance.deleteWindow(this.windowId)

        Overlay.closeWindow(this.parentInstance.characterName, this.windowId)
        clearInterval(this.positionSaveInterval)

        log.info("window closed", this.windowName, this.windowId)
    }

    restore() {
        if(!this.minimized || !this.preMinimizeRect) { return; }
        log.info("Restoring window", this.windowId, this.windowName)
        this.setPosition(this.preMinimizeRect.pos.x, this.preMinimizeRect.pos.y);
        this.minimized = false
        this.preMinimizeRect = undefined
        this.reposition();
    }

    minimize(): boolean {
        if(this.minimized) { return false; }
        log.info("Minimizing window", this.windowId, this.windowName)
        // TODO: add hiding to C++?
        const bounds = this.electronWindow.getBounds()
        this.preMinimizeRect = {size: {width: bounds.width, height: bounds.height}, pos: {x: bounds.x, y: bounds.y}}
        // TODO: don't set width/height to 0. if the EVE client resizes while a window is minimized at 0,0 size it appears
        // the overlay C++ gets messed up for that window and stops rendering even though frame buffers are still being sent
        Overlay.setWindowPosition(this.parentInstance.characterName, this.windowId, -10000, -10000);
        this.minimized = true
        return true;
    }

    focus() {
        this.electronWindow.focusOnWebView()
    }

    blur() {
        if(this.childWindow !== undefined) {
            this.childWindow.blur();
        }
        this.electronWindow.blurWebView();
    }

    setPosition(x: number, y: number) {
        if(this.lastImage) {
            this.lastImage.rect.x = x;
            this.lastImage.rect.y = y;
        }
        Overlay.setWindowPosition(this.parentInstance.characterName, this.windowId, x, y);
        this.electronWindow.setPosition(x, y)
        this.hasUnsavedBounds = true;
    }

    setSize(width: number, height: number) {
        this.electronWindow.setSize(width, height);
        this.hasUnsavedBounds = true;
    }

    setBounds(rect: Rect) {
        const currentBounds = this.electronWindow.getBounds();
        if(currentBounds.width == rect.size.width && currentBounds.height == rect.size.height && (currentBounds.x != rect.pos.x || currentBounds.y != rect.pos.y)) {
            // position changed but size did not, tell overlay DLL to move the rect since paint wont occur
            // if the size changes we update the size/pos via the framebuffer itself
            Overlay.setWindowPosition(this.parentInstance.characterName, this.windowId, rect.pos.x, rect.pos.y);
        }
        if(this.lastImage) {
            this.lastImage.rect.x = rect.pos.x;
            this.lastImage.rect.y = rect.pos.y;
        }
        this.electronWindow.setBounds({width: rect.size.width, height: rect.size.height, x: rect.pos.x, y: rect.pos.y})
        this.hasUnsavedBounds = true;
    }

    clearHover() {
        this.electronWindow.webContents.executeJavaScript("window.dispatchEvent(new Event('clearHover'));")
    }

    private setupIpc() {
        ipcMain.on("createChildWindow", this.handleCreateChildWindow)
        ipcMain.on("closeChildWindow", this.handleCloseChildWindow)
        ipcMain.on("positionChildWindow", this.handlePositionChildWindow)
    }

    private teardownIpc() {
        ipcMain.removeListener("createChildWindow", this.handleCreateChildWindow)
        ipcMain.removeListener("closeChildWindow", this.handleCloseChildWindow)
        ipcMain.removeListener("positionChildWindow", this.handlePositionChildWindow)
    }

    private handleCreateChildWindow = (event: IpcMainEvent, url: string, x: number, y: number, width: number, height: number) => {
        if(event.sender.id !== this.webContentsId) {return;}

        if(this.childWindow !== undefined) {
            log.error("Attempted to create child window when there already is one!");
            return;
        }

        this.childWindow = new ChildWindow(url, {size: {width, height}, pos: {x, y}}, this.handleChildWindowPaint, this.handleChildWindowCursor, this.handleChildWindowTitle);
        this.childRect = {size: {width, height}, pos: {x, y}};
    }

    private handleChildWindowTitle = (title: string) => {
        if(!this.closed && this.windowName == "externalsite") {
            this.electronWindow.webContents.send("setTitle", title);
        }
    }

    private handleCloseChildWindow = (event: IpcMainEvent) => {
        if(event.sender.id !== this.webContentsId) {return;}

        this.closeChildWindow()
    }


    private handlePositionChildWindow = (event: IpcMainEvent, x: number, y: number, width: number, height: number) => {
        if(event.sender.id !== this.webContentsId) {return;}

        if(this.childWindow !== undefined) {
            this.childRect = {size: {width, height}, pos: {x, y}}
            this.childWindow.resize(width, height)
        }
    }

    private closeChildWindow() {
        if(this.childWindow !== undefined) {
            this.childWindow.close();
        }
        this.childWindow = undefined
        this.lastChildImage = undefined
        this.childRect = undefined
    }

    sendInputEvent(inputEvent: any) {

        if(this.minimized || this.closed) { return; }

        // transform the event in eveinstance and pass it here
        if (this.childWindow !== undefined && this.childRect !== undefined) {

            if (inputEvent.type === "mouseMove" || inputEvent.type === "mouseUp" || inputEvent.type === "mouseDown" || inputEvent.type == "mouseWheel") {
                // mouse event
                let bounds = this.childRect
                let newX = inputEvent.x - bounds.pos.x;
                let newY = inputEvent.y - bounds.pos.y;
                // make sure this is still inside the bounding box
                const newInput = {...inputEvent, x: newX, y: newY};
                if (newX >= 0 && newY >= 0 && newX <= bounds.size.width && newY <= bounds.size.height) {
                    // mouse is inside child window
                    if (inputEvent.type === "mouseDown") {
                        // clicked inside child window, mark it focused
                        this.childWindowFocused = true;
                    } else if (inputEvent.type === "mouseMove") {
                        // send move events to our window so things unhighlight etc properly
                        this.electronWindow.webContents.sendInputEvent(inputEvent);
                    }
                    this.childWindow.sendInputEvent(newInput);
                } else {
                    // we're outside of the child window
                    if (inputEvent.type === "mouseDown") {
                        // clicked outside child window (but still inside us), remove focus from child
                        this.childWindow.blur();
                        this.childWindowFocused = false;
                    } else if (inputEvent.type === "mouseMove") {
                        // send move events to child window so things unhighlight etc properly
                        this.childWindow.sendInputEvent(newInput);
                    }
                    // send it to our own window
                    this.electronWindow.webContents.sendInputEvent(inputEvent);
                }
            } else {
                // keyboard event
                if (this.childWindowFocused) {
                    this.childWindow.sendInputEvent(inputEvent)
                } else {
                    this.electronWindow.webContents.sendInputEvent(inputEvent);
                }
            }
        } else {

            // no child window, just send it to our main window
            this.electronWindow.webContents.sendInputEvent(inputEvent);
        }
    }

    private handleChildWindowPaint = (dirtyRect: Electron.Rectangle, nativeImage: Electron.NativeImage) => {
        if(this.closed) { return; }
        this.lastChildImage = {buffer: nativeImage.getBitmap(), dirty: dirtyRect, rect: {x: this.childRect!.pos.x, y: this.childRect!.pos.y, width: nativeImage.getSize().width, height: nativeImage.getSize().height}}
        if(this.minimized) { return; }

        // i'm not entirely sure if using setImmediate has any benefit or downside.
        setImmediate(() => {
            this.paint()
            if(this.lastChildImage) {
                this.lastChildImage.dirty.width = 0;
                this.lastChildImage.dirty.height = 0;
            }
        });
    }


    private handleChildWindowCursor = (cursor: string) => {
        if(this.minimized) { return; }
        try {
            Overlay.sendCommand(this.parentInstance.characterName, {command: "cursor", cursor})
        } catch(ex) {
            log.info("Exception setting cursor for child window", this.windowName, this.windowId, ex)
        }
    }

    private linkWindowToOverlay() {
        Overlay.addWindow(this.parentInstance.characterName, this.windowId, {
            name: this.windowName + "-" + this.windowId,
            resizable: this.isResizable,
            maxWidth: this.isResizable
                ? 3440
                : this.electronWindow.getBounds().width,
            maxHeight: this.isResizable // TODO: maxHeight is somehow mixed up with maxWidth
                ? 1440
                : this.electronWindow.getBounds().height,
            minWidth: this.electronWindow.resizable ? 50 : this.electronWindow.getBounds().width,
            minHeight: this.electronWindow.resizable ? 50 : this.electronWindow.getBounds().height,
            nativeHandle: this.electronWindow.getNativeWindowHandle().readUInt32LE(0),
            rect: {
                ...this.electronWindow.getBounds()
            },
            caption: {
                left: dragBorder,
                right: 50,
                top: dragBorder,
                height: captionHeight
            },
            dragBorderWidth: dragBorder
        })
    }

    private paint = () => {
        if(this.minimized) { return; }

        if(this.lastImage == undefined) {
            return; // parent window hasn't drawn yet
        } else if(this.childWindow === undefined || this.lastChildImage === undefined || this.childRect === undefined) {
            Overlay.sendFrameBuffer(this.parentInstance.characterName, this.windowId, this.lastImage);
        } else {
            Overlay.sendFrameBuffer(this.parentInstance.characterName, this.windowId, this.lastImage, this.lastChildImage);
        }
    }

    private hookWindow() {
        this.electronWindow.webContents.on("new-window", (e, url) => {
            e.preventDefault()
            shell.openExternal(url)
        })

        this.electronWindow.webContents.on(
            "paint",
            (event, dirty, nativeImage: Electron.NativeImage) => {
                if(this.closed) {return;}

                const [x,y] = this.electronWindow.getPosition();
                this.lastImage = {buffer: nativeImage.getBitmap(), dirty: dirty, rect: {x: x, y: y, width: nativeImage.getSize().width, height: nativeImage.getSize().height}}
                // i'm not entirely sure if using setImmediate has any benefit or downside.
                setImmediate(() => {
                    this.paint()
                    if(this.lastImage) {
                        this.lastImage.dirty.width = 0;
                        this.lastImage.dirty.height = 0;
                    }
                });
            }
        )

        this.electronWindow.on("resize", (e) => {
            if(!this.minimized && !this.closed) {this.hasUnsavedBounds = true;}
        })

        this.electronWindow.on("move", () => {
            if(!this.minimized && !this.closed) {this.hasUnsavedBounds = true;}
        })

        this.electronWindow.on("close", (e) => {
            try {
                if(this.closed) {return;}
                this.close();
            } catch(ex) {
                log.error("Exception closing overlay window", this.windowName, this.windowId, ex);
                return;
            }

        })

        this.electronWindow.webContents.on("cursor-changed", (event, type) => {
            if(this.closed || this.minimized) {return;}
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
                    log.info("Exception setting cursor", this.windowName, this.windowId, ex)
                }
            }
        })
    }

    private calculateWindowRect(): Electron.Rectangle {

        const resolution = this.parentInstance.gameResolution

        let bounds = {width: 300, height: 300, x: 0, y: 0};

        if(!resolution) { log.warn("no resolution in calculatewindowrect", this.windowId, this.windowName); return bounds; }

        if (this.windowName in defaultSizes) {
            const defaultSize = defaultSizes[this.windowName];
            bounds = {x: defaultSize.x, y: defaultSize.y, width: defaultSize.width, height: defaultSize.height};
        }

        if(positionStore.has(this.windowHash)) {
            const position = positionStore.get(this.windowHash) as StoredWindowPosition
            if(this.windowName !== "welcome" && this.windowName !== "about") {
                // don't read size for the welcome window. Technically it should never change anyways,
                // but due to a bug with DPI some ended up saving a huge welcome screen that can't be reset without
                // deleting the appdata files.
                // TODO: have a per-window config in one spot so i dont have these 'if window name equals' stuff everywhere
                bounds.width = position.width
                bounds.height = position.height
            }

            // new max X and Y based on current resolution
            const maxX = resolution.width - bounds.width
            const maxY = resolution.height - bounds.height

            if(position.left != undefined) {
                bounds.x = Math.max(Math.min(position.left, maxX), 0);
            } else if(position.right != undefined) {
                bounds.x = Math.max(Math.min(resolution.width - bounds.width - position.right, maxX), 0);
            } else if(position.xRatio != undefined) {
                // coordinate = (ratio * gameMiddlepoint) + gameMiddlepoint - (windowWidth / 2)

                bounds.x = Math.max(Math.min(Math.floor((position.xRatio * (resolution.width / 2)) + (resolution.width / 2) - (bounds.width / 2)), maxX), 0)
            } else {
                log.warn("no X coordinate in position store", position);
                bounds.x = 0
            }

            if(position.top != undefined) {
                bounds.y = Math.max(Math.min(position.top, maxY), 0);
            } else if(position.bottom != undefined) {
                bounds.y = Math.max(Math.min(resolution.height - bounds.height - position.bottom, maxY), 0);
            } else if(position.yRatio != undefined) {
                bounds.y = Math.max(Math.min(Math.floor((position.yRatio * (resolution.height / 2)) + (resolution.height / 2) - (bounds.height / 2)), maxY), 0);
            } else {
                log.warn("no Y coordinate in position store", position);
            }

        } else {
            // No stored position. Center the window.
            bounds.x = Math.max(Math.floor((resolution.width / 2) - (bounds.width / 2)), 0)
            bounds.y = Math.max(Math.floor((resolution.height / 2) - (bounds.height / 2)), 0)
        }

        return bounds;
    }

}