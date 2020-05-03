import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { Fragment } from "react";
import { render } from "react-dom";
import { AppContainer as ReactHotAppContainer } from "react-hot-loader";
import Root from "./Root";
import "./app.global.scss";
import store from "./store";
import { replayActionRenderer } from "electron-redux";
import { ipcRenderer, IpcRendererEvent } from "electron";
import log from "../shared/log";

log.info("Starting renderer process");

replayActionRenderer(store);

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

ipcRenderer.on("setTitle", (event: IpcRendererEvent, title: string) => {
  document.title = title;
});

document.addEventListener("DOMContentLoaded", () =>
  render(
    <AppContainer>
      <Root />
    </AppContainer>,
    document.getElementById("root")
  )
);
