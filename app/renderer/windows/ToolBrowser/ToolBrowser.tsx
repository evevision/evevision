import React from 'react';
import styles from './toolbrowser.scss'
import {Panel} from '../../ui/Layout';
import {default as tools, AllTags, ToolDescription, ExternalToolMeta} from "./tools";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {ipcRenderer} from "electron";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface ToolBrowserState {
    selectedTags: string[]
}

// TODO: hiding tools
// TODO: json custom tool import/export so people can share their corp's links easily
// TODO: order so custom tools are before others

class ToolBrowser extends React.PureComponent<{}, ToolBrowserState> {

    explorerRef: any;

    state: ToolBrowserState = {
        selectedTags: []
    }

    constructor(props: {}) {
        super(props);
        this.explorerRef = React.createRef();
    }

    componentDidMount() {
        document.title = ""; // titleless, this has a different style
    }

    selectTag = (tag: string) => {
        if(!this.state.selectedTags.includes(tag)) {
            this.setState({...this.state, selectedTags: [...this.state.selectedTags, tag]})
            console.log("reee")
        }
    }

    unselectTag = (tag: string) => {
        if(this.state.selectedTags.includes(tag)) {
            this.setState({...this.state, selectedTags: this.state.selectedTags.filter(st => st !== tag)})
        }
    }

    resetTags = () => {
        this.setState({...this.state, selectedTags: []})
    }

    tag = (tag: string) => {
        return <div className={styles["tooltag"]} onClick={() => this.selectTag(tag)}>{tag}</div>;
    }

    headerTag = (tag: string) => {
        return <div className={styles["headertag"]} onClick={() => {
            if(this.state.selectedTags.length == 0) {
                this.selectTag(tag)
            } else {
                this.unselectTag(tag)
            }
        }}>{tag}</div>;
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
                <div id="explorer" ref={this.explorerRef}>
                    <div className={styles["welcome"]}>
                        <h2>Welcome to the Tool Explorer</h2>
                        <span>
                            Use your favorite third party tools directly within EVE Online. Most popular tools are
                            already included, but you can add anything we may have missed or tools that are private to your corporation.
                        </span>
                    </div>
                    <div className={`${styles.headertags}`}>
                        {this.state.selectedTags.length > 0 ? this.state.selectedTags.map(this.headerTag) : AllTags.map(this.headerTag)}
                    </div>
                    <div className={`${styles.toolgrid} eve-scrollbar`}>
                        {this.state.selectedTags.length > 0 ?
                            tools.filter(t => t.tags.filter(t => this.state.selectedTags.includes(t)).length == this.state.selectedTags.length).map(this.tool)
                        : tools.map(this.tool)}
                    </div>
                </div>
            </div>
        );
    }
}
export default ToolBrowser;
