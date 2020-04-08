// This is the RENDERER PROCESS entry point.

import "core-js/stable";
import "regenerator-runtime/runtime";

import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import './app.global.scss';
import store from './store/renderer';
import {replayActionRenderer} from 'electron-redux';
import Moment from "react-moment";
import moment from "moment";
import {app, ipcRenderer, IpcRendererEvent} from 'electron';
import * as Sentry from '@sentry/electron';
const { version } = require('package.json');
/*
if(app.isPackaged) {
    // this is only for production builds being released on github
    // it reports exceptions so I can know if a new release is causing issues for any number of users immediately
    // please do NOT use this in development and disable it entirely if you are testing packaging.
    Sentry.init({
        release: 'evevision@' + version,
        dsn: 'https://6ef229c5e2a94db5ab9c6ae1669b8a25@o374578.ingest.sentry.io/5192804'
    });
}
*/
moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('ss', 0);
Moment.globalMoment = moment;

replayActionRenderer(store);

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

ipcRenderer.on("setTitle", (event: IpcRendererEvent, title: string) => {
    document.title = title
})

document.addEventListener('DOMContentLoaded', () =>
  render(
    <AppContainer>
      <Root/>
    </AppContainer>,
    document.getElementById('root')
  )
);
