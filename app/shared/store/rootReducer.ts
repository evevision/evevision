import { characterReducer } from "./characters/reducers";
import { combineReducers } from "redux";

export const rootReducer = combineReducers({
  characters: characterReducer,
});

export type AppState = ReturnType<typeof rootReducer>;
