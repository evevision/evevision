import React, { Component } from "react";
import { Button } from "../../ui/Input";
import {ipcRenderer} from "electron";
import Store from "electron-store";
import styles from "./FavoritesMenu.scss";
import {default as tools, ToolDescription} from "./tools";

const favoriteTools = new Store({ name: "favorite-tools", watch: true });

interface FavoritesMenuState {
    favoriteTools: string[]
}

class FavoritesMenu extends Component<{}, FavoritesMenuState> {

    toolsCallback?: () => void;

    state = {
        favoriteTools: favoriteTools.get("favoriteTools")
    };

    constructor(props: {}) {
        super(props);
    }

    componentDidMount(): void {
        this.toolsCallback = favoriteTools.onDidChange("favoriteTools", (newValue, oldValue) => {
            this.setState({...this.state, favoriteTools: newValue})
        });
    }

    componentWillUnmount(): void {
        this.toolsCallback(); // unsubscribe
    }

    tool = (tool: string) => {
        const toolDesc = tools.find(t => t.name === tool)
        if(toolDesc) {
            let icon
            if(toolDesc.external) {
                const url = new URL(toolDesc.external.url)
                icon = "https://" + url.host + "/favicon.ico"
            } else {
                icon = "https://eveonline.com/favicon.ico"
            }
            return <div className={styles["tool"]}>
                <div className={styles["icon"]} style={{
                    backgroundImage: "url(" + icon + ")"
                }}></div>
                <div className={styles["name"]}>{tool}</div>
            </div>
        } else {
            return ""
        }
    }

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
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "ToolExplorer");
                    }}>Open Tool Explorer</Button>
                </div>
            </>
        );
    }
}
export default FavoritesMenu;
