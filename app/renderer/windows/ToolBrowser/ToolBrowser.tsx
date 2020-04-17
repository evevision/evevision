import React from 'react';
import styles from './toolbrowser.scss'
import {Panel} from '../../ui/Layout';
import {default as tools, ToolDescription, ExternalToolMeta} from "./tools";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {ipcRenderer} from "electron";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface ToolBrowserState {
}

class ToolBrowser extends React.PureComponent<{}, ToolBrowserState> {
    state: ToolBrowserState = {
    }

    constructor(props: {}) {
        super(props);
    }

    componentDidMount() {
        document.title = ""; // titleless, this has a different style
    }

    tag = (tag: string) => {
        return <h3>{tag}</h3>;
    }

    tool = (tool: ToolDescription) => {
        const icon = "https://eveonline.com/favicon.ico"
        const handleClick = () => {
            if(tool.external) {
                ipcRenderer.send("openWindow", "externalsite", tool.external.url)
            } else {
                ipcRenderer.send("openWindow", tool.windowName)
            }
        }

        return (
            <div className={styles["tool"]}>
                <div className={styles["corner"]}></div>
                <div className={styles["icon"]} style={{
                    backgroundImage: "url(" + icon + ")"
                }}></div>
                <div className={styles["header"]}>
                    <FontAwesomeIcon icon={faInfoCircle} className={styles["info-icon"]}/>
                    <h1>{tool.name}</h1>
                    <h2>{tool.author}</h2>
                </div>
                <div className={styles["footer"]}>
                    <div className={styles["tags"]}>
                        {tool.tags.map(this.tag)}
                        {tool.external ? <h5>External Tool</h5> : <h5>EveVision Core</h5>}
                    </div>
                    <div className={styles["buttons"]}>
                        <div className={styles["button"]}>
                            Favorite
                        </div>
                        <div className={styles["button"]} onClick={handleClick}>
                            Launch
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className={styles["container"]}>
                <div className={styles["welcome"]}>
                    <h2>Welcome to the Tool Browser</h2>
                    <span>
                        Utilize your favorite third party tools directly within EVE Online. Most popular tools are
                        already included, but you can add anything we may have missed or tools that are private to your corporation.
                    </span>
                </div>

                <div className={styles["toolgrid"]}>
                    {tools.map(this.tool)}
                </div>
            </div>
        );
    }
}
export default ToolBrowser;
