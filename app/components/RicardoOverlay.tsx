import React, {Component} from 'react';
import {AppState} from "../store/rootReducer";
import {connect} from "react-redux";
import {ipcRenderer, IpcRendererEvent} from "electron";

interface RicardoProps {
}

interface RicardoState {
    dancing: boolean
}

export default class RicardoOverlay extends Component<RicardoProps, RicardoState> {

    constructor(props: RicardoProps) {
        super(props)
        this.state = {
            dancing: false,
        }
    }

    handleRicardo = (event: IpcRendererEvent, dancing: boolean) => {
        this.setState({...this.state, dancing})
    }

    componentDidMount(): void {
        ipcRenderer.on("ricardo", this.handleRicardo)
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener("ricardo", this.handleRicardo)
    }

    render() {
        return this.state.dancing ? <div className={"ricardo"}></div> : ""
    }
}