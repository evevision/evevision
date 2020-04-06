import WebSocket from 'ws';
import store from '../store/main';
import {Unsubscribe} from "redux";
import {AppState} from "../store/rootReducer";
import {ApiConnectionStatus, CharacterEsiAuth, CharacterInfo} from "../store/characters/types";
import {updateApiState, updateCharacterAuth} from "../store/characters/actions";
import superagent from "superagent";

// This is where we'll handle updating the ESI creds for now
export default class ApiClient {

    socket?: WebSocket
    storeSubscription?: Unsubscribe

    characterId: number
    auth?: CharacterEsiAuth
    connected: boolean = false
    connecting: boolean = false
    refreshingBeforeConnect: boolean = false
    started: boolean = false
    refreshTimer?: NodeJS.Timeout

    constructor(characterId: number) {
        this.characterId = characterId;
    }

    start() {
        this.started = true
        this.subscribeToState();
        this.handleStateChange();
    }

    stop() {
        this.started = false
        this.unsubscribeFromState();
        this.disconnect();
        this.auth = undefined
        this.connected = false
        this.connecting = false
    }

    send(action: String, payload: any) {
        if(this.socket !== undefined && this.connected && this.started) {
            const strPayload = JSON.stringify({action: action, payload: payload})
            console.log("WSAPI-" + this.characterId + ": sending ", strPayload)
            this.socket.send(strPayload)
        }
    }

    // remember, this is not only a state change handler but also an initializer
    private handleStateChange = async () => {
        if(!this.started) { return; }
        const state: AppState = store.getState() as AppState;
        const character: CharacterInfo | undefined = state.characters.characters.find(c => c.id == this.characterId)
        if(character !== undefined && character.auth !== undefined) {
            const priorAuth = this.auth
            this.auth = character.auth

            if(priorAuth == undefined) {
                // no auth previously set. either we disconnected or this is the first time connecting.
                // make sure we don't need to refresh right now
                if((this.auth.expiresAt - new Date().getTime()) < 5*60*1000) {
                    // we're within the refresh period, refresh before connecting
                    console.log("WSAPI-" + this.characterId + ": refreshing token before connection")
                    this.refreshingBeforeConnect = true;
                    await this.refreshAccessToken();
                    // defer connecting until the entire app has the updated access token
                } else {
                    // go ahead and connect now
                    this.connect();
                    this.startRefreshTimer();
                }
            } else {
                // character had auth previously set
                if(priorAuth.accessToken !== this.auth.accessToken) {
                    // we had an access token but it's different from this one that just got set.
                    // if we're already connected, just tell the API the new token. if we're not connected, connect with this new token.
                    if(this.refreshingBeforeConnect) {
                        this.refreshingBeforeConnect = false
                        console.log("WSAPI-" + this.characterId + ": connecting after token refresh")
                        this.connect();
                    }
                    this.sendNewAccessToken();
                    this.startRefreshTimer(); // reset the timer for this new access token
                }
            }
        } else {
            // character not in state or doesn't have auth
            this.auth = undefined
            this.disconnect();
        }
    }

    private subscribeToState() {
        if(this.storeSubscription !== undefined) {
            this.unsubscribeFromState();
        }
        // TODO: this is a lowlevel api we probably shouldnt be using. it gets called any time the state changes ANYWHERE in the app.
        this.storeSubscription = store.subscribe(this.handleStateChange);
    }

    private unsubscribeFromState() {
        if(this.storeSubscription !== undefined) {
            this.storeSubscription();
        }
    }

    private refreshAccessToken = async () => {
        if(this.auth !== undefined) {
            console.log("WSAPI-" + this.characterId + ": refreshing access token")
            try {
                const res = await superagent.post("https://login.eveonline.com/oauth/token")
                    .auth("", "") // these are invalidated now, gonna move to PKCS. this was only meant as a test.
                    .send({grant_type: 'refresh_token', refresh_token: this.auth.refreshToken});

                const accessToken = res.body.access_token
                const refreshToken = res.body.refresh_token
                const expiresIn = res.body.expires_in // always 1200 but we'll read it anyways just in case they change something
                const expiresAt = new Date().getTime() + (expiresIn * 1000)
                console.log("WSAPI-" + this.characterId + ": successfully refreshed access token")
                store.dispatch(updateCharacterAuth({accessToken, refreshToken, expiresAt}, this.characterId))
                // the refresh timer will be reset by the state handler
            } catch(error) {
                console.error("WSAPI-" + this.characterId + ": Error getting oauth token", error)
            }
        }
    }

    private clearRefreshTimer() {
        if(this.refreshTimer !== undefined) {
            console.log("WSAPI-" + this.characterId + ": clearing existing refresh timer")
            clearTimeout(this.refreshTimer)
            this.refreshTimer = undefined
        }
    }

    private startRefreshTimer() {
        if(this.auth !== undefined) {
            this.clearRefreshTimer();
            const refreshMs = this.auth.expiresAt - new Date().getTime() - (5*60*1000)
            console.log("WSAPI-" + this.characterId + ": refresh timer set for " + (refreshMs/1000/60).toFixed(1) + " minutes")
            this.refreshTimer = setTimeout(this.refreshAccessToken, refreshMs)
        }
    }

    private sendNewAccessToken() {
        if(this.auth !== undefined) {
            this.send("updateAccessToken", {accessToken: this.auth.accessToken})
        }
    }

    private handleOpen = () => {
        console.log("WSAPI-" + this.characterId + ": connection opened")
        this.connected = true
        this.connecting = false
        store.dispatch(updateApiState(this.characterId, {status: ApiConnectionStatus.CONNECTED}));
    }

    private handleClose = () => {
        if(this.connecting) {
            console.error("WSAPI-" + this.characterId + ": connection failed")
            this.connecting = false
            // failure during connection process
            this.connect();
        } else if(this.connected) {
            // we were connected and did not manually disconnect when this happened
            // reconnect
            console.warn("WSAPI-" + this.characterId + ": connection closed unexpectedly, reconnecting")
            this.connected = false
            this.connect();
        } else {
            // we disconnected ourselves
            console.log("WSAPI-" + this.characterId + ": connection successfully closed")
        }
    }

    private handleError = (err: Error) => {
        if(this.connecting) {
            // error during connection
            console.error("WSAPI-" + this.characterId + ": CONNECTION ERROR", err.message)
        } else {
            console.error("WSAPI-" + this.characterId + ": ERROR", err.message)
        }
    }

    private handleMessage = (message: object) => {
        // hi
    }

    private connect() {
        if(this.auth === undefined) {
            console.error("Attempted to connect to API without valid access token")
            return;
        }
        if(this.connecting) { return }
        if(this.connected) { this.disconnect(); }

        console.log("WSAPI-" + this.characterId + ": opening connection")
        this.connecting = true
        store.dispatch(updateApiState(this.characterId, {status: ApiConnectionStatus.CONNECTING}));
        this.socket = new WebSocket("wss://api.eve.vision/?token=" + encodeURI(this.auth.accessToken))
            .on("open", this.handleOpen)
            .on("close", this.handleClose)
            .on("error", this.handleError)
            .on("message", this.handleMessage)
    }

    private disconnect() {
        if(this.socket == undefined) {
            return;
        }

        console.log("WSAPI-" + this.characterId + ": closing connection")
        this.connected = false;
        this.socket.close();
        this.socket = undefined;
        this.clearRefreshTimer();
        store.dispatch(updateApiState(this.characterId, {status: ApiConnectionStatus.DISCONNECTED}));
    }
}