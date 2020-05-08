import React from "react";
import styles from "./ToolExplorer.scss";
import { default as tools, ToolDescription, defaultFavorites } from "./tools";
import { faInfoCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ipcRenderer } from "electron";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import Store from "electron-store";
import RemoteFavicon from "./RemoteFavicon";
import logo from "../../images/logo.png";
import log from "../../../shared/log";
import { TextInput } from "../../ui/Input";

const customTools = new Store({ name: "custom-tools", watch: true });
const favoriteTools = new Store({ name: "favorite-tools", watch: true });

interface ToolExplorerState {
  selectedTags: string[];
  customTools: ToolDescription[];
  favoriteTools: string[];
  // add tool dialog
  addToolsOpen: boolean;
  addToolName: string;
  addToolAuthor: string;
  addToolDescription: string;
  addToolUrl: string;
  addToolInitialSize: string;
  addToolMinSize: string;
  addToolMaxSize: string;
}

class ToolExplorer extends React.PureComponent<{}, ToolExplorerState> {
  explorerRef: any;
  tags: string[];
  favoriteToolsCallback?: () => void;
  customToolsCallback?: () => void;

  defaultAddToolState = {
    addToolName: "",
    addToolAuthor: "",
    addToolDescription: "",
    addToolUrl: "https://",
    addToolInitialSize: "500x500",
    addToolMinSize: "500x500",
    addToolMaxSize: "",
  };

  state: ToolExplorerState = {
    selectedTags: [],
    favoriteTools: favoriteTools.get("favoriteTools", defaultFavorites),
    customTools: customTools.get("customTools", []),
    addToolsOpen: false,
    ...this.defaultAddToolState,
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
    this.tags.push("custom");
  };

  componentDidMount() {
    document.title = "TOOL Explorer";
    this.favoriteToolsCallback = favoriteTools.onDidChange(
      "favoriteTools",
      (newValue, oldValue) => {
        this.setState({ ...this.state, favoriteTools: newValue });
      }
    );
    this.customToolsCallback = customTools.onDidChange(
      "customTools",
      (newValue, oldValue) => {
        this.setState({ ...this.state, customTools: newValue });
      }
    );
  }

  componentWillUnmount(): void {
    if (this.favoriteToolsCallback) {
      this.favoriteToolsCallback();
    } // unsubscribe

    if (this.customToolsCallback) {
      this.customToolsCallback();
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
    this.setState({
      ...this.state,
      addToolsOpen: true,
      ...this.defaultAddToolState,
    });
  };

  closeAddTools = () => {
    this.setState({ ...this.state, addToolsOpen: false });
  };

  handleAddToolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ ...this.state, [event.target.name]: event.target.value });
  };

  buildToolDescription = (): ToolDescription => {
    // parse min/max/initial
    const regex = /^\d{1,4}[xX]\d{1,4}$/gm;
    const [initialWidth, initialHeight] = this.state.addToolInitialSize.match(
      regex
    )
      ? this.state.addToolInitialSize.toLowerCase().split("x")
      : ["500", "500"];
    const [minWidth, minHeight] = this.state.addToolMinSize.match(regex)
      ? this.state.addToolMinSize.toLowerCase().split("x")
      : [undefined, undefined];
    const [maxWidth, maxHeight] = this.state.addToolMaxSize.match(regex)
      ? this.state.addToolMaxSize.toLowerCase().split("x")
      : [undefined, undefined];

    const isResizable = (minWidth && minHeight) || (maxWidth && maxHeight);

    return {
      name: this.state.addToolName,
      description: this.state.addToolDescription,
      author: this.state.addToolAuthor,
      tags: ["custom"],
      external: {
        url: this.state.addToolUrl,
        initialWidth: parseInt(initialWidth),
        initialHeight: parseInt(initialHeight),
        resizable: isResizable
          ? {
              minWidth: minWidth ? parseInt(minWidth) : undefined,
              maxWidth: maxWidth ? parseInt(maxWidth) : undefined,
              minHeight: minHeight ? parseInt(minHeight) : undefined,
              maxHeight: maxHeight ? parseInt(maxHeight) : undefined,
            }
          : undefined,
      },
    };
  };

  handleAddToolInstall = () => {
    const toolDesc = this.buildToolDescription();
    log.info("Adding custom tool", toolDesc);
    const newCustomTools = [...this.state.customTools, toolDesc];
    customTools.set("customTools", newCustomTools);
    this.setState({
      ...this.state,
      addToolsOpen: false,
      customTools: newCustomTools,
    });
  };

  handleAddToolTest = () => {
    const toolDesc = this.buildToolDescription();
    log.info("Testing custom tool", toolDesc);
    ipcRenderer.send("openExternalTool", toolDesc.external);
  };

  deleteCustomTool = (toolName: string) => {
    if (this.state.customTools.find((ct) => ct.name === toolName)) {
      customTools.set(
        "customTools",
        this.state.customTools.filter((ct) => ct.name !== toolName)
      );
    }
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
        key={tag}
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
        key={tag}
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
        key={tool.name}
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
          {tool.tags.includes("custom") ? (
            <FontAwesomeIcon
              size={"lg"}
              icon={faTrash}
              className={styles["info-icon"]}
              data-tip={"Delete this custom tool"}
              onClick={() => this.deleteCustomTool(tool.name)}
            />
          ) : (
            ""
          )}
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
            styles["dialog"] +
            (this.state.addToolsOpen ? " " + styles["visible"] : "")
          }
        >
          <div className={styles["dialogContents"]}>
            <div className={styles["createTool"]}>
              <h2>Install Custom TOOL</h2>
              <div className={styles["registerForm"]}>
                <label className={styles["line"]}>
                  <span>Name:</span>
                  <TextInput
                    onChange={this.handleAddToolChange}
                    value={this.state.addToolName}
                    name="addToolName"
                  ></TextInput>
                </label>
                <label className={styles["line"]}>
                  <span>Author:</span>
                  <TextInput
                    onChange={this.handleAddToolChange}
                    value={this.state.addToolAuthor}
                    name="addToolAuthor"
                  ></TextInput>
                </label>
                <label className={styles["line"]}>
                  <span>Description:</span>
                  <TextInput
                    onChange={this.handleAddToolChange}
                    value={this.state.addToolDescription}
                    name="addToolDescription"
                  ></TextInput>
                </label>
                <label className={styles["line"]}>
                  <span>URL:</span>
                  <TextInput
                    onChange={this.handleAddToolChange}
                    value={this.state.addToolUrl}
                    name="addToolUrl"
                  ></TextInput>
                </label>
                <h3>
                  Window Size <small>(don't set min/max for unresizable)</small>
                </h3>
                <label className={styles["line"]}>
                  <span>Initial:</span>
                  <TextInput
                    onChange={this.handleAddToolChange}
                    value={this.state.addToolInitialSize}
                    name="addToolInitialSize"
                  ></TextInput>
                  <span>Min:</span>
                  <TextInput
                    onChange={this.handleAddToolChange}
                    value={this.state.addToolMinSize}
                    name="addToolMinSize"
                  ></TextInput>
                  <span>Max:</span>
                  <TextInput
                    onChange={this.handleAddToolChange}
                    value={this.state.addToolMaxSize}
                    name="addToolMaxSize"
                  ></TextInput>
                </label>

                <div className={styles["buttons"]}>
                  <div
                    className={styles["button"]}
                    onClick={this.handleAddToolTest}
                  >
                    Test
                  </div>
                  <div
                    className={styles["button"]}
                    onClick={this.handleAddToolInstall}
                  >
                    Install
                  </div>
                </div>
              </div>
            </div>
            <div className={styles["importTools"]}>
              <h2>TOOL Import</h2>
              You can import and export your custom TOOLs via your clipboard as
              JSON to easily share with fellow capsuleers.
              <div className={styles["buttons"]}>
                <div className={styles["button"]}>Import</div>
                <div className={styles["button"]}>Export All</div>
              </div>
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
            {this.state.customTools.map(this.tool)}
            {tools.map(this.tool)}
          </div>

          <div className={`${styles.footerButtons}`}>
            <div className={styles["button"]} onClick={this.openAddTools}>
              Customize
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ToolExplorer;
