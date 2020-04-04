import {applyMiddleware, createStore} from 'redux'
import { forwardToRenderer, triggerAlias } from 'electron-redux';
import promise from 'redux-promise-middleware'
import {rootReducer} from './rootReducer'
import { persistStore, persistReducer } from 'redux-persist';
import createElectronStorage from "redux-persist-electron-storage";
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

console.log("Initialized main process store")

// https://blog.reactnativecoach.com/the-definitive-guide-to-redux-persist-84738167975
const persistConfig = {
    key: 'root',
    storage: createElectronStorage(),
    stateReconciler: autoMergeLevel2 // see "Merge Process" section for details.
};

const pReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(pReducer,
    applyMiddleware(
        triggerAlias,
        promise,
        // add more middleware here
        forwardToRenderer
    ));

export const persistor = persistStore(store);

if (!process.env.NODE_ENV && module.hot) {
    console.log("Redux hot reload enabled")
    module.hot.accept('./reducers', () => {
        store.replaceReducer(require('./reducers'));
    });
}

export default store;