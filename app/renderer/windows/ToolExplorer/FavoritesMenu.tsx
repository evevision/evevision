import React, { Component } from "react";
import { Button } from "../../ui/Input";
import { ipcRenderer } from "electron";
import Store from "electron-store";
import styles from "./FavoritesMenu.scss";
import { default as tools, defaultFavorites, ToolDescription } from "./tools";
import RemoteFavicon from "./RemoteFavicon";

const customTools = new Store({ name: "custom-tools", watch: true });
const favoriteTools = new Store({ name: "favorite-tools", watch: true });

interface FavoritesMenuState {
  favoriteTools: string[];
  mergedTools: ToolDescription[];
}

class FavoritesMenu extends Component<{}, FavoritesMenuState> {
  favoriteToolsCallback?: () => void;
  customToolsCallback?: () => void;

  state = {
    favoriteTools: favoriteTools.get("favoriteTools", defaultFavorites),
    mergedTools: [...tools, ...customTools.get("customTools", [])],
  };

  componentDidMount(): void {
    this.favoriteToolsCallback = favoriteTools.onDidChange(
      "favoriteTools",
      (newValue, oldValue) => {
        this.setState({ ...this.state, favoriteTools: newValue });
      }
    );
    this.customToolsCallback = customTools.onDidChange(
      "customTools",
      (newValue, oldValue) => {
        this.setState({ ...this.state, mergedTools: [...tools, ...newValue] });
      }
    );
  }

  componentWillUnmount(): void {
    if (this.favoriteToolsCallback) {
      this.favoriteToolsCallback(); // unsubscribe
    }
    if (this.customToolsCallback) {
      this.customToolsCallback(); // unsubscribe
    }
  }

  tool = (tool: string) => {
    const toolDesc = this.state.mergedTools.find((t) => t.name === tool);
    if (toolDesc) {
      return (
        <div
          className={styles["tool"]}
          onClick={() => {
            if (toolDesc.external) {
              ipcRenderer.send("openExternalTool", toolDesc.external);
            } else {
              ipcRenderer.send("openWindow", toolDesc.windowName);
            }
          }}
        >
          <RemoteFavicon
            url={
              toolDesc.external
                ? toolDesc.external.url
                : "https://eveonline.com/favicon.ico"
            }
            size={32}
          />
          <div className={styles["name"]}>{tool}</div>
        </div>
      );
    } else {
      return "";
    }
  };

  render() {
    return (
      <>
        <div className="eve-overlay-menu-title">Favorite TOOLs</div>
        <div className="eve-minimized-windows-list eve-scrollbar">
          <div className={styles["tools"]}>
            {this.state.favoriteTools.map(this.tool)}
          </div>
        </div>
        <div className="eve-overlay-menu-buttons">
          <Button
            onClick={() => {
              ipcRenderer.send("openWindow", "toolexplorer");
            }}
          >
            Open TOOL Explorer
          </Button>
        </div>
      </>
    );
  }
}
export default FavoritesMenu;
