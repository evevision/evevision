import "core-js/stable";
import "regenerator-runtime/runtime";
import { app, session } from "electron";
import MainApp from "./mainapp";
import store from "./store";
import { replayActionMain } from "electron-redux";
import { version } from "../package.json";
import { init as SentryInit } from "@sentry/electron/dist/main";
import { isSentryEnabled, dsn } from "./sentry";
import log from "../shared/log";

const cicd = process.env.CICD === "true" || process.argv[1] === "CICD";

if (cicd) {
  log.info("CICD environment detected");
}

if (isSentryEnabled && !cicd) {
  SentryInit({
    release: "v" + version,
    dsn: dsn
  });
}

log.info("Initializing EveVision " + version);
const locked = app.requestSingleInstanceLock();

if (!locked) {
  log.warn("Could not acquire single instance lock, exiting");
  app.exit(1);
} else {
  log.info("Initializing store");
  replayActionMain(store);

  // hardware acceleration causes issues with offscreen rendering, i.e. blurring while resizing and general slowness, due
  // to having to copy from GPU instead of processing entirely in CPU. however, it means no webGL or 3D CSS.
  app.disableHardwareAcceleration();

  // force DPI scaling to 100%
  // TODO: stop doing this, fix the problem with DPI
  app.commandLine.appendSwitch("high-dpi-support", "1");
  app.commandLine.appendSwitch("force-device-scale-factor", "1");

  let mainApp: MainApp;

  const init = async () => {
    session.defaultSession.webRequest.onBeforeSendHeaders(
      (details, callback) => {
        details.requestHeaders["User-Agent"] =
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/82.0.4058.2 Safari/537.36 EveVision/" +
          version;
        callback({ cancel: false, requestHeaders: details.requestHeaders });
      }
    );

    mainApp = new MainApp();
    mainApp.start();
  };

  app.on("ready", () => {
    log.info("Electron ready, initializing EveVision " + version);
    if (!mainApp) init();
  });
}
