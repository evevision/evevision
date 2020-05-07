import React from "react";
import styles from "./ToolExplorer.scss";
import { default as tools, ToolDescription, defaultFavorites } from "./tools";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { ipcRenderer } from "electron";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import Store from "electron-store";
import RemoteFavicon from "./RemoteFavicon";
import logo from "../../images/logo.png";
import {TextInput} from "../../ui/Input";

const favoriteTools = new Store({ name: "favorite-tools", watch: true });

interface ToolExplorerState {
  selectedTags: string[];
  favoriteTools: string[];
  addToolsOpen: boolean;
}

// TODO: hiding tools
// TODO: json custom tool import/export so people can share their corp's links easily
// TODO: order so custom tools are before others
// TODO: favorites, reset favorites button
// TODO: highlight selected tags inside tool

class ToolExplorer extends React.PureComponent<{}, ToolExplorerState> {
  explorerRef: any;
  tags: string[];
  toolsCallback?: () => void;

  state: ToolExplorerState = {
    selectedTags: [],
    favoriteTools: favoriteTools.get("favoriteTools") || defaultFavorites,
    addToolsOpen: false,
  };

  constructor(props: {}) {
    super(props);
    this.explorerRef = React.createRef();
    this.tags = [];
    this.calculateTags();
  }

  calculateTags = () => {
    const tagCounts: { tag: string; count: number }[] = [];
    tools.forEach((tool) => {
      tool.tags.forEach((tag) => {
        const tagCount = tagCounts.find((tc) => tc.tag === tag);
        if (tagCount) {
          tagCount.count += 1;
        } else {
          tagCounts.push({ tag: tag, count: 1 });
        }
      });
    });

    tagCounts
      .sort((a, b) => b.count - a.count)
      .forEach((tagCount) => this.tags.push(tagCount.tag));
  };

  componentDidMount() {
    document.title = "TOOL Explorer";
    this.toolsCallback = favoriteTools.onDidChange(
      "favoriteTools",
      (newValue, oldValue) => {
        this.setState({ ...this.state, favoriteTools: newValue });
      }
    );
  }

  componentWillUnmount(): void {
    if (this.toolsCallback) {
      this.toolsCallback();
    } // unsubscribe
  }

  selectTag = (tag: string) => {
    if (!this.state.selectedTags.includes(tag)) {
      this.setState({
        ...this.state,
        selectedTags: [...this.state.selectedTags, tag],
      });
    }
  };

  unselectTag = (tag: string) => {
    if (this.state.selectedTags.includes(tag)) {
      this.setState({
        ...this.state,
        selectedTags: this.state.selectedTags.filter((st) => st !== tag),
      });
      setImmediate(ReactTooltip.rebuild); // rebuild after state change
    }
  };

  addFavorite = (tool: string) => {
    if (!this.state.favoriteTools.includes(tool)) {
      favoriteTools.set("favoriteTools", [...this.state.favoriteTools, tool]);
    }
  };

  removeFavorite = (tool: string) => {
    if (this.state.favoriteTools.includes(tool)) {
      favoriteTools.set(
        "favoriteTools",
        this.state.favoriteTools.filter((ft) => ft !== tool)
      );
    }
  };

  toggleFavorite = (tool: string) => {
    if (!this.state.favoriteTools.includes(tool)) {
      this.addFavorite(tool);
    } else {
      this.removeFavorite(tool);
    }
  };

  openAddTools = () => {
    this.setState({ ...this.state, addToolsOpen: true });
  };

  closeAddTools = () => {
    this.setState({ ...this.state, addToolsOpen: false });
  };

  resetTags = () => {
    this.setState({ ...this.state, selectedTags: [] });
  };

  tag = (tag: string) => {
    return (
      <div
        className={
          styles["tooltag"] +
          (this.state.selectedTags.includes(tag)
            ? " " + styles["selected"]
            : "")
        }
        onClick={() => {
          if (this.state.selectedTags.includes(tag)) {
            this.unselectTag(tag);
          } else {
            this.selectTag(tag);
          }
        }}
      >
        {tag}
      </div>
    );
  };

  headerTag = (tag: string) => {
    return (
      <div
        className={
          styles["headertag"] +
          (this.state.selectedTags.length === 0 ||
          this.state.selectedTags.includes(tag)
            ? " " + styles["visible"]
            : "")
        }
        onClick={() => {
          if (this.state.selectedTags.length === 0) {
            this.selectTag(tag);
          } else {
            this.unselectTag(tag);
          }
        }}
      >
        {tag}
      </div>
    );
  };

  tool = (tool: ToolDescription) => {
    const handleClick = () => {
      if (tool.external) {
        ipcRenderer.send("openExternalTool", tool.external);
      } else {
        ipcRenderer.send("openWindow", tool.windowName);
      }
    };

    const visible =
      tool.tags.filter((t) => this.state.selectedTags.includes(t)).length ===
      this.state.selectedTags.length;

    return (
      <div
        className={styles["tool"] + (visible ? " " + styles["visible"] : "")}
      >
        <div className={styles["corner"]}></div>
        <div className={styles["icon"]}>
          <RemoteFavicon
            url={
              tool.external
                ? tool.external.url
                : "https://eveonline.com/favicon.ico"
            }
            size={32}
          />
        </div>
        <div className={styles["header"]}>
          <FontAwesomeIcon
            size={"lg"}
            icon={faInfoCircle}
            className={styles["info-icon"]}
            data-tip={tool.description}
          />
          <h1>{tool.name}</h1>
          <h2>{tool.author}</h2>
        </div>
        <div className={styles["footer"]}>
          <div className={styles["tags"]}>
            {tool.tags.sort((a, b) => a.length - b.length).map(this.tag)}
          </div>
          <div className={`${styles["buttons"]} ${styles["shadow-container"]}`}>
            <div
              className={styles["button"]}
              onClick={() => this.toggleFavorite(tool.name)}
            >
              {this.state.favoriteTools.includes(tool.name)
                ? "Unfavorite"
                : "Favorite"}
            </div>
            <div className={styles["button"]} onClick={handleClick}>
              Launch
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className={styles["container"]}>
        <div
          className={
            styles["dialogBlackout"] +
            (this.state.addToolsOpen ? " " + styles["visible"] : "")
          }
          onClick={this.closeAddTools}
        ></div>
        <div
          className={
            styles["dialog"] + (this.state.addToolsOpen ? " " + styles["visible"] : "")
          }
        >
          <div className={styles["dialogContents"]}>
            <div className={styles["createTool"]}>
              <h2>Create custom TOOL</h2>
              <span>Name:</span> <TextInput>lol</TextInput>
              <br />
              <span>Initial URL:</span> https://<TextInput></TextInput>

            </div>
            <div className={styles["importTools"]}>
              <h2>Import/Export custom TOOLs</h2>
              You can import and export custom tools as JSON to easily share with fellow capsuleers.
              <br />
            </div>
          </div>
        </div>

        <div id="explorer" ref={this.explorerRef}>
          <div className={styles["welcome"]}>
            <h2>Welcome to the TOOL Explorer</h2>
            <span>
              Triglavian Optical Overlay Links (TOOLs) can greatly improve your
              quality of life as a capsuleer by extending your Neocom's built-in
              capabilities. Click on tags to filter or start typing to search
              for a TOOL by name. Almost every TOOL known to New Eden is listed
              in this directory.
            </span>
          </div>

          <div className={styles["logo"]}>
            <img src={logo} />
          </div>

          <div className={`${styles.headertags}`}>
            <div className={`${styles["shadow-container"]}`}>
              {this.tags.map(this.headerTag)}
            </div>
          </div>

          <div className={`${styles.toolgrid} eve-scrollbar`}>
            {tools.map(this.tool)}
          </div>

          <div className={`${styles.footerButtons}`}>
            <div className={styles["button"]} onClick={this.openAddTools}>
              Add TOOLs
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ToolExplorer;
