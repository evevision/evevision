import React, {Component} from 'react';
import {AppState} from "../store/rootReducer";
import {connect} from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faBiohazard, faWindowRestore, faWindowClose } from '@fortawesome/free-solid-svg-icons'
import {Button} from '../ui/Input';
import {ipcRenderer, IpcRendererEvent} from "electron";

interface MenuProps {
}

interface MenuState {
    expanded: boolean
    minimizedWindows: MinimizedWindow[]
}

interface MinimizedWindow {
    windowId: number,
    windowTitle: string,
    closable: boolean
}

class OverlayMenu extends Component<MenuProps, MenuState> {

    private closeTimer?: NodeJS.Timeout

    constructor(props: MenuProps) {
        super(props)
        this.state = {
            expanded: false,
            minimizedWindows: []
        }
    }

    handleAddMinimizedWindow = (event: IpcRendererEvent, windowId: number, windowTitle: string, closable: boolean) => {
        this.setState({...this.state, minimizedWindows: [...this.state.minimizedWindows, {windowId, windowTitle, closable}]})
    }

    handleRemoveMinimizedWindow = (event: IpcRendererEvent, windowId: number) => {
        this.setState({...this.state, minimizedWindows: this.state.minimizedWindows.filter(w => w.windowId !== windowId)})
    }

    componentDidMount(): void {
        ipcRenderer.on("addMinimizedWindow", this.handleAddMinimizedWindow)
        ipcRenderer.on("removeMinimizedWindow", this.handleRemoveMinimizedWindow)
        window.addEventListener("clearHover", this.handleClearHover);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener("addMinimizedWindow", this.handleAddMinimizedWindow)
        ipcRenderer.removeListener("removeMinimizedWindow", this.handleRemoveMinimizedWindow)
        window.removeEventListener("clearHover", this.handleClearHover);
    }

    toggleExpand = () => {
        this.setState({...this.state, expanded: !this.state.expanded})
    }

    setExpanded = (expanded: boolean) => {
        this.setState({...this.state, expanded})
    }

    restoreWindow(windowId: number) {
        ipcRenderer.send("restoreWindow", windowId)
        this.setState({...this.state, minimizedWindows: this.state.minimizedWindows.filter(w => w.windowId !== windowId)})
    }

    closeWindow(windowId: number) {
        ipcRenderer.send("closeMinimizedWindow", windowId)
        this.setState({...this.state, minimizedWindows: this.state.minimizedWindows.filter(w => w.windowId !== windowId)})
    }

    restoreAll = () => {
        ipcRenderer.send("restoreAllWindows")
        this.setState({...this.state, minimizedWindows: []})
    }

    minimizeAll = () => {
        ipcRenderer.send("minimizeAllWindows")
    }

    handleClearHover = () => {
        if(this.state.expanded && !this.closeTimer) {
            this.closeTimer = setTimeout(() => {this.setExpanded(false); this.closeTimer = undefined;}, 1000)
        }
    }

    handleMouseEnter = () => {
        if(this.closeTimer) {
            clearTimeout(this.closeTimer)
            this.closeTimer = undefined;
        }
    }

    windowEntry(window: MinimizedWindow) {
        return (
            <div className="eve-minimized-window" onClick={() => this.restoreWindow(window.windowId)}>
                {window.closable ? <FontAwesomeIcon icon={faWindowClose} onClick={() => this.closeWindow(window.windowId)} className={"eve-minimized-window-button close"}/> : null}
                <FontAwesomeIcon icon={faWindowRestore} onClick={() => this.restoreWindow(window.windowId)} className={"eve-minimized-window-button restore"}/>
                <span className={"eve-minimized-window-title"}>{window.windowTitle}</span>
            </div>
        )
    }

    render() {
        return <div className={this.state.expanded ? "eve-overlay-menu expanded" : "eve-overlay-menu collapsed"} onMouseOver={this.handleMouseEnter}>
            <div className="eve-overlay-menu-expander" onClick={this.toggleExpand} onContextMenu={this.minimizeAll}><FontAwesomeIcon icon={faBiohazard} className={"eve-overlay-menu-expander-icon"}/></div>
            <div className="eve-overlay-menu-contents">
                <div className="eve-overlay-menu-title">Minimized Windows</div>
                <div className="eve-minimized-windows-list eve-scrollbar">
                    {this.state.minimizedWindows.map(w => this.windowEntry(w))}
                </div>
                <div className="eve-overlay-menu-buttons">
                    <Button onClick={this.restoreAll}>Restore All</Button>
                    <Button onClick={this.minimizeAll}>Minimize Open Windows</Button>
                </div>
            </div>
            <div className="eve-border-corner-top-left" />
            <div className="eve-border-corner-top-right" />
            <div className="eve-border-corner-bottom-right" />
            <div className="eve-border-corner-bottom-left" />
        </div>
    }
}

const mapStateToProps = (state: AppState, ownProps: MenuProps) => {
    return {}
}

export default connect(
    mapStateToProps,
    {}
)(OverlayMenu);