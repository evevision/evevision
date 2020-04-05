import "core-js/stable";
import "regenerator-runtime/runtime";

import { app, protocol } from 'electron';
import MainApp from './mainapp';
import store from './store/main';
import {replayActionMain} from 'electron-redux';
replayActionMain(store);

// hardware acceleration causes issues with offscreen rendering, i.e. blurring while resizing and general slowness, due
// to having to copy from GPU instead of processing entirely in CPU. however, it means no webGL or 3D CSS.
app.disableHardwareAcceleration();

// force DPI scaling to 100%
app.commandLine.appendSwitch('high-dpi-support', "1");
app.commandLine.appendSwitch('force-device-scale-factor', "1");

let mainApp: MainApp;

const init = async () => {
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
