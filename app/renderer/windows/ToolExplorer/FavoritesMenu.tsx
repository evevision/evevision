import React, { Component } from "react";
import { Button } from "../../ui/Input";
import { ipcRenderer } from "electron";
import Store from "electron-store";
import styles from "./FavoritesMenu.scss";
import { default as tools, defaultFavorites } from "./tools";
import RemoteFavicon from "./RemoteFavicon";

const favoriteTools = new Store({ name: "favorite-tools", watch: true });

interface FavoritesMenuState {
  favoriteTools: string[];
}

class FavoritesMenu extends Component<{}, FavoritesMenuState> {
  toolsCallback?: () => void;

  state = {
    favoriteTools: favoriteTools.get("favoriteTools") || defaultFavorites
  };

  componentDidMount(): void {
    this.toolsCallback = favoriteTools.onDidChange(
      "favoriteTools",
      (newValue, oldValue) => {
        this.setState({ ...this.state, favoriteTools: newValue });
      }
    );
  }

  componentWillUnmount(): void {
    this.toolsCallback(); // unsubscribe
  }

  tool = (tool: string) => {
    const toolDesc = tools.find(t => t.name === tool);
    if (toolDesc) {
      return (
        <div
          className={styles["tool"]}
          onClick={() => {
            if (toolDesc.external) {
              ipcRenderer.send(
                "openWindow",
                "openExternalTool",
                toolDesc.external
              );
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
        <div className="eve-overlay-menu-title">Favorite Tools</div>
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
            Open Tool Explorer
          </Button>
        </div>
      </>
    );
  }
}
export default FavoritesMenu;
