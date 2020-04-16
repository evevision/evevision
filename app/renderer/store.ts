import { applyMiddleware, createStore } from "redux";
import { rootReducer } from "../shared/store/rootReducer";
import { forwardToMain, getInitialStateRenderer } from "electron-redux";
import promise from "redux-promise-middleware";

export interface AppState {}

const initialState = getInitialStateRenderer();

const store = createStore(
  rootReducer,
  initialState,
  applyMiddleware(
    forwardToMain,
    promise
    // add more middleware here
  )
);

export default store;
