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
 
    export function start(arg: {characterName: string}): void;
    export function stop(): void;
    export function setEventCallback(cb: (event: string, ...args: any[]) => void): void;
    export function sendCommand(arg: {command: "cursor", cursor: string}): void;
    export function addWindow(windowId: number, details: IOverlayWindowDetails): void;
    export function closeWindow(windowId: number): void;
    export function sendFrameBuffer(
        windowId: number,
        parent: IFrameBuffer,
        child?: IFrameBuffer
    ): void;
    export function setWindowPosition(windowId: number, x: number, y: number): void;
    export function translateInputEvent(event: {windowId: number, msg: number, wparam: number, lparam: number}): any;
}