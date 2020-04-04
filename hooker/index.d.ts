/// <reference types="node" />
declare module "hooker" {

    export interface IProcessThread {
        processId: number, 
        threadId: number,
        dllPath: string;
    }

    export interface IWindow extends IProcessThread {
        windowId: number;
        title: string;
        exeName: string;
    }

    export interface IInjectResult {
        injectHelper: string;
        injectDll: string;
        injectSucceed: boolean;
    }

    export function getTopWindows(): IWindow[];
    export function injectProcess(process: IProcessThread): IInjectResult;
}