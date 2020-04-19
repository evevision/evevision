import React from 'react';
import styles from './ToolExplorer.scss'
import {default as tools, ToolDescription, ExternalToolMeta} from "./tools";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {ipcRenderer} from "electron";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import Store from "electron-store";
import RemoteFavicon from "./RemoteFavicon";

const favoriteTools = new Store({ name: "favorite-tools", watch: true });

interface ToolExplorerState {
    selectedTags: string[],
    favoriteTools: string[]
}

// TODO: hiding tools
// TODO: json custom tool import/export so people can share their corp's links easily
// TODO: order so custom tools are before others
// TODO: favorites, reset favorites button
// TODO: highlight selected tags inside tool

class ToolExplorer extends React.PureComponent<{}, ToolExplorerState> {

    explorerRef: any;
    customToolsRef: any;
    tags: string[];
    toolsCallback?: () => void;

    state: ToolExplorerState = {
        selectedTags: [],
        favoriteTools: favoriteTools.get("favoriteTools")
    }

    constructor(props: {}) {
        super(props);
        this.explorerRef = React.createRef();
        this.tags = [];
        this.calculateTags();
    }

    calculateTags = () => {
        const tagCounts: {tag: string, count: number}[] = []
        tools.forEach(tool => {
            tool.tags.forEach(tag => {
                const tagCount = tagCounts.find(tc => tc.tag === tag);
                if (tagCount) {
                    tagCount.count += 1;
                } else {
                    tagCounts.push({tag: tag, count: 1});
                }
            })
        })

        tagCounts.sort((a,b) => b.count-a.count).forEach(tagCount => this.tags.push(tagCount.tag))
    }

    componentDidMount() {
        document.title = "Tool Explorer";
        this.toolsCallback = favoriteTools.onDidChange("favoriteTools", (newValue, oldValue) => {
            this.setState({...this.state, favoriteTools: newValue})
        });
    }

    componentWillUnmount(): void {
        if(this.toolsCallback) { this.toolsCallback(); } // unsubscribe
    }

    selectTag = (tag: string) => {
        if(!this.state.selectedTags.includes(tag)) {
            this.setState({...this.state, selectedTags: [...this.state.selectedTags, tag]})
        }
    }

    unselectTag = (tag: string) => {
        if(this.state.selectedTags.includes(tag)) {
            this.setState({...this.state, selectedTags: this.state.selectedTags.filter(st => st !== tag)})
            setImmediate(ReactTooltip.rebuild); // rebuild after state change
        }
    }

    addFavorite = (tool: string) => {
        if(!this.state.favoriteTools.includes(tool)) {
            favoriteTools.set("favoriteTools", [...this.state.favoriteTools, tool])
        }
    }

    removeFavorite = (tool: string) => {
        if(this.state.favoriteTools.includes(tool)) {
            console.log("remove ", tool)
            favoriteTools.set("favoriteTools", this.state.favoriteTools.filter(ft => ft !== tool))
        }
    }

    toggleFavorite = (tool: string) => {
        if(!this.state.favoriteTools.includes(tool)) {
            this.addFavorite(tool);
        } else {
            this.removeFavorite(tool);
        }
    }

    resetTags = () => {
        this.setState({...this.state, selectedTags: []})
    }

    tag = (tag: string) => {
        return <div className={styles["tooltag"] + (this.state.selectedTags.includes(tag) ? " " + styles["selected"] : "")}
                    onClick={() => {
                        if(this.state.selectedTags.includes(tag)) {
                            this.unselectTag(tag)
                        } else {
                            this.selectTag(tag)
                        }
                    }}>{tag}</div>;
    }

    headerTag = (tag: string) => {
        return <div className={styles["headertag"] + (this.state.selectedTags.length == 0 || this.state.selectedTags.includes(tag) ? " " + styles["visible"] : "")} onClick={() => {
            if(this.state.selectedTags.length == 0) {
                this.selectTag(tag)
            } else {
                this.unselectTag(tag)
            }
        }}>{tag}</div>;
    }

    tool = (tool: ToolDescription) => {
        const handleClick = () => {
            if(tool.external) {
                ipcRenderer.send("openWindow", "externalsite", tool.external.url)
            } else {
                ipcRenderer.send("openWindow", tool.windowName)
            }
        }

        const visible = tool.tags.filter(t => this.state.selectedTags.includes(t)).length == this.state.selectedTags.length;

        return (
            <div className={styles["tool"] + (visible ? " " + styles["visible"] : "")}>
                <div className={styles["corner"]}></div>
                <div className={styles["icon"]}>
                    <RemoteFavicon url={tool.external ? tool.external.url : "https://eveonline.com/favicon.ico"} size={32}/>
                </div>
                <div className={styles["header"]}>
                    <FontAwesomeIcon size={"lg"} icon={faInfoCircle} className={styles["info-icon"]} data-tip={tool.description}/>
                    <h1>{tool.name}</h1>
                    <h2>{tool.author}</h2>
                </div>
                <div className={styles["footer"]}>
                    <div className={styles["tags"]}>
                        {tool.tags.sort((a,b) => a.length-b.length).map(this.tag)}
                    </div>
                    <div className={`${styles["buttons"]} ${styles["shadow-container"]}`}>
                        <div className={styles["button"]} onClick={() => this.toggleFavorite(tool.name)}>
                            {this.state.favoriteTools.includes(tool.name) ? "Unfavorite" : "Favorite"}
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
                <ReactTooltip multiline={true} effect={"solid"} arrowColor={"black"} class={styles["tooltip"]} />
                <div id="explorer" ref={this.explorerRef}>
                    <div className={styles["welcome"]}>
                        <h2>Welcome to the Tool Explorer</h2>
                        <span>
                            Use your favorite third party tools directly within EVE Online. Most popular tools are
                            already included, but you will soon be able to add your own tools.
                        </span>
                    </div>
                    <div className={`${styles.headertags}`}>
                        <div className={`${styles["shadow-container"]}`}>
                            {this.tags.map(this.headerTag)}
                        </div>
                    </div>
                    <div className={`${styles.toolgrid} eve-scrollbar`}>
                        {tools.map(this.tool)}
                    </div>
                </div>
            </div>
        );
    }
}
export default ToolExplorer;
