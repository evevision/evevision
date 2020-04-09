// This is the MAIN PROCESS entry point. Despite the .dev.ts name, the production build is ultimately built from this.
import "core-js/stable";
import "regenerator-runtime/runtime";

import { app, session } from 'electron';
import MainApp from './mainapp';
import store from './store/main';
import {replayActionMain} from 'electron-redux';
const log = require('electron-log');
import { init as SentryInit } from '@sentry/electron/dist/main';
import {version} from './package.json';

const locked = app.requestSingleInstanceLock()

if (!locked) {
    app.quit()
} else {
    // this is only for production builds being released on github
    // it reports exceptions so I can know if a new release is causing issues for any number of users immediately
    // please do NOT use this locally

    //SentryInit({
    //    release: 'evevision@' + version,
    //    dsn: 'https://6ef229c5e2a94db5ab9c6ae1669b8a25@o374578.ingest.sentry.io/5192804'
    //});
    //log.info("Main sentry initialized")

    replayActionMain(store);

    // hardware acceleration causes issues with offscreen rendering, i.e. blurring while resizing and general slowness, due
    // to having to copy from GPU instead of processing entirely in CPU. however, it means no webGL or 3D CSS.
    app.disableHardwareAcceleration();

    // force DPI scaling to 100%
    // TODO: stop doing this, fix the problem with DPI
    app.commandLine.appendSwitch('high-dpi-support', "1");
    app.commandLine.appendSwitch('force-device-scale-factor', "1");

    let mainApp: MainApp;

    const init = async () => {
        session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
            details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/82.0.4058.2 Safari/537.36 EveVision/' + version;
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });

        mainApp = new MainApp();
        mainApp.start();
    };

    app.on('window-all-closed', () => {
        app.quit()
    });

    app.on('ready', init);

    app.on('activate', () => {
        if (mainApp === null) init();
    });

}
