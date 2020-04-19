import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { Fragment } from "react";
import { render } from "react-dom";
import { AppContainer as ReactHotAppContainer } from "react-hot-loader";
import Root from "./containers/Root";
import "./app.global.scss";
import store from "./store";
import { replayActionRenderer } from "electron-redux";
import Moment from "react-moment";
import moment from "moment";
import { ipcRenderer, IpcRendererEvent } from "electron";

moment.relativeTimeThreshold("s", 60);
moment.relativeTimeThreshold("ss", 0);
Moment.globalMoment = moment;

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
