import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWindowRestore,
  faWindowClose
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/Input";
import { ipcRenderer, IpcRendererEvent } from "electron";

interface MinimizedWindowMenuState  {
  minimizedWindows: MinimizedWindow[];
}

interface MinimizedWindow {
  windowId: number;
  windowTitle: string;
  closable: boolean;
}

class MinimizedWindowMenu extends Component<{}, MinimizedWindowMenuState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      minimizedWindows: []
    };
  }

  handleAddMinimizedWindow = (
    _event: IpcRendererEvent,
    windowId: number,
    windowTitle: string,
    closable: boolean
  ) => {
    this.setState({
      ...this.state,
      minimizedWindows: [
        ...this.state.minimizedWindows,
        { windowId, windowTitle, closable }
      ]
    });
  };

  handleRemoveMinimizedWindow = (
    _event: IpcRendererEvent,
    windowId: number
  ) => {
    this.setState({
      ...this.state,
      minimizedWindows: this.state.minimizedWindows.filter(
        w => w.windowId !== windowId
      )
    });
  };

  componentDidMount(): void {
    ipcRenderer.on("addMinimizedWindow", this.handleAddMinimizedWindow);
    ipcRenderer.on("removeMinimizedWindow", this.handleRemoveMinimizedWindow);
  }

  componentWillUnmount(): void {
    ipcRenderer.removeListener(
      "addMinimizedWindow",
      this.handleAddMinimizedWindow
    );
    ipcRenderer.removeListener(
      "removeMinimizedWindow",
      this.handleRemoveMinimizedWindow
    );
  }

  restoreWindow(windowId: number) {
    ipcRenderer.send("restoreWindow", windowId);
    this.setState({
      ...this.state,
      minimizedWindows: this.state.minimizedWindows.filter(
        w => w.windowId !== windowId
      )
    });
  }

  closeWindow(windowId: number) {
    ipcRenderer.send("closeMinimizedWindow", windowId);
    this.setState({
      ...this.state,
      minimizedWindows: this.state.minimizedWindows.filter(
        w => w.windowId !== windowId
      )
    });
  }

  restoreAll = () => {
    ipcRenderer.send("restoreAllWindows");
    this.setState({ ...this.state, minimizedWindows: [] });
  };

  minimizeAll = () => {
    ipcRenderer.send("minimizeAllWindows");
  };

  windowEntry(window: MinimizedWindow) {
    return (
      <div
        className="eve-minimized-window"
        onClick={() => this.restoreWindow(window.windowId)}
      >
        {window.closable ? (
          <FontAwesomeIcon
            icon={faWindowClose}
            onClick={() => this.closeWindow(window.windowId)}
            className={"eve-minimized-window-button close"}
          />
        ) : null}
        <FontAwesomeIcon
          icon={faWindowRestore}
          onClick={() => this.restoreWindow(window.windowId)}
          className={"eve-minimized-window-button restore"}
        />
        <span className={"eve-minimized-window-title"}>
          {window.windowTitle}
        </span>
      </div>
    );
  }

  render() {
    return (
        <>
          <div className="eve-overlay-menu-title">Minimized Windows</div>
          <div className="eve-minimized-windows-list eve-scrollbar">
            {this.state.minimizedWindows.map(w => this.windowEntry(w))}
          </div>
          <div className="eve-overlay-menu-buttons">
            <Button onClick={this.restoreAll}>Restore All</Button>
            <Button onClick={this.minimizeAll}>Minimize Open Windows</Button>
          </div>
        </>
    );
  }
}
export default MinimizedWindowMenu;
