/// <reference types="node" />

declare module "overlay" {

    export interface IRectangle {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    interface IOverlayWindowDetails{
        name: string;
        resizable: boolean;
        maxWidth: number;
        maxHeight: number;
        minWidth: number;
        minHeight: number;
        rect: IRectangle;
        nativeHandle: number;
        dragBorderWidth?: number;
        caption?: {
            left: number;
            right: number;
            top: number;
            height: number;
        }
    }

    export interface IFrameBuffer {
        buffer: Buffer,
        rect: IRectangle,
        dirty: IRectangle
    }

    // todo: make all these use arg arrays (like addwindow) instead of positional elements
    export function start(characterName: string): void;
    export function stop(characterName: string): void;
    export function setEventCallback(characterName: string, cb: (event: string, ...args: any[]) => void): void;
    export function sendCommand(characterName: string, arg: {command: "cursor", cursor: string}): void;
    export function addWindow(characterName: string, windowId: number, details: IOverlayWindowDetails): void;
    export function closeWindow(characterName: string, windowId: number): void;
    export function sendFrameBuffer(
        characterName: string,
        windowId: number,
        parent: IFrameBuffer,
        child?: IFrameBuffer
    ): void;
    export function setWindowPosition(characterName: string, windowId: number, x: number, y: number): void;
    export function translateInputEvent(event: {windowId: number, msg: number, wparam: number, lparam: number}): any;
}