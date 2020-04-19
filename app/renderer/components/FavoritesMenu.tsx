import React, { Component } from "react";
import { Button } from "../ui/Input";
import {ipcRenderer} from "electron";

interface FavoritesMenuState  {
}

class FavoritesMenu extends Component<{}, FavoritesMenuState> {

    constructor(props: {}) {
        super(props);
        this.state = {
        };
    }

    componentDidMount(): void {
    }

    componentWillUnmount(): void {
    }

    render() {
        return (
            <>
                <div className="eve-overlay-menu-title">Favorite Tools</div>
                <div className="eve-minimized-windows-list eve-scrollbar">
                    u fucken wot m8
                </div>
                <div className="eve-overlay-menu-buttons">
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "toolbrowser");
                    }}>Open Tool Explorer</Button>
                </div>
            </>
        );
    }
}
export default FavoritesMenu;
