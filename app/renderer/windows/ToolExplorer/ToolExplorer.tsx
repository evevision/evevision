import React from "react";
import styles from "./ToolExplorer.scss";
import { default as tools, ToolDescription, defaultFavorites } from "./tools";
import { faInfoCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ipcRenderer, clipboard } from "electron";
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

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(this.state.addToolUrl);
    } catch (ex) {
      log.error("Could not parse URL for custom tool", ex);
    }
    const sanitizePattern = /[^a-z0-9!@#$%^&*() ]/gi;
    const allowedProtocols = ["http:", "https:", "file:"]; // file is only allowed if added manually, not via json import

    return {
      name: this.state.addToolName.replace(sanitizePattern, ""),
      description: this.state.addToolDescription.replace(sanitizePattern, ""),
      author: this.state.addToolAuthor.replace(sanitizePattern, ""),
      tags: ["custom"],
      external: {
        url: parsedUrl
          ? (allowedProtocols.includes(parsedUrl.protocol)
              ? parsedUrl.protocol
              : "https:") +
            "//" +
            (parsedUrl.host
              ? parsedUrl.host + parsedUrl.pathname
              : parsedUrl.pathname)
          : "https://www.google.com/",
        initialWidth: Math.max(Math.min(parseInt(initialWidth), 2000), 100),
        initialHeight: Math.max(Math.min(parseInt(initialHeight), 2000), 100),
        resizable: isResizable
          ? {
              minWidth: minWidth
                ? Math.max(Math.min(parseInt(minWidth), 2000), 100)
                : undefined,
              maxWidth: maxWidth
                ? Math.max(parseInt(maxWidth), 100)
                : undefined,
              minHeight: minHeight
                ? Math.max(Math.min(parseInt(minHeight), 2000), 100)
                : undefined,
              maxHeight: maxHeight
                ? Math.max(parseInt(maxHeight), 100)
                : undefined,
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

  handleImport = () => {
    const text: string = clipboard.readText("clipboard");

    // Just to help out copypasters, search for the first and last JSON tokens
    const pattern = /(\[\{.+\}\])/;
    const matches = text.match(pattern);
    if (matches) {
      const [json] = matches;
      try {
        const tools: ToolDescription[] = JSON.parse(json);
        const sanitizedTools: ToolDescription[] = [];

        const sanitizePattern = /[^a-z0-9!@#$%^&*() ]/gi;

        tools.forEach((tool) => {
          if (!(tool.name && tool.external && tool.external.url)) {
            log.error("Tool import was missing data", tool);
          } else {
            const sanitizedToolName = tool.name.replace(sanitizePattern, "");
            if (
              this.state.customTools.find((ct) => ct.name === sanitizedToolName)
            ) {
              log.warn(
                "Ignoring json import of tool due to existing tool sharing name",
                sanitizedToolName
              );
            } else {
              let parsedUrl: URL;
              try {
                parsedUrl = new URL(tool.external.url);
              } catch (ex) {
                log.error("Could not parse URL for importing custom tool", ex);
              }
              const sanitizedTool: ToolDescription = {
                name: sanitizedToolName,
                author: tool.author.replace(sanitizePattern, ""),
                tags: ["custom"],
                description: tool.description.replace(sanitizePattern, ""),
                external: {
                  url: parsedUrl
                    ? (parsedUrl.protocol === "http:" ? "http:" : "https:") +
                      "//" +
                      (parsedUrl.host
                        ? parsedUrl.host + parsedUrl.pathname
                        : "www.google.com")
                    : "https://www.google.com/",
                  initialWidth: tool.external.initialWidth
                    ? Math.max(Math.min(tool.external.initialWidth, 2000), 100)
                    : 500,
                  initialHeight: tool.external.initialHeight
                    ? Math.max(Math.min(tool.external.initialHeight, 2000), 100)
                    : 500,
                  resizable: tool.external.resizable
                    ? {
                        minWidth: tool.external.resizable.minWidth
                          ? Math.max(
                              Math.min(tool.external.resizable.minWidth, 2000),
                              100
                            )
                          : undefined,
                        maxWidth: tool.external.resizable.maxWidth
                          ? Math.max(tool.external.resizable.maxWidth, 100)
                          : undefined,
                        minHeight: tool.external.resizable.minHeight
                          ? Math.max(
                              Math.min(tool.external.resizable.minHeight, 2000),
                              100
                            )
                          : undefined,
                        maxHeight: tool.external.resizable.maxHeight
                          ? Math.max(tool.external.resizable.maxHeight, 100)
                          : undefined,
                      }
                    : undefined,
                },
              };

              log.info("Importing custom tool from JSON", sanitizedTool);
              sanitizedTools.push(sanitizedTool);
            }
          }
        });

        const newCustomTools = [...this.state.customTools, ...sanitizedTools];
        customTools.set("customTools", newCustomTools);
        this.setState({
          ...this.state,
          addToolsOpen: false,
          customTools: newCustomTools,
        });
      } catch (ex) {
        log.error("Could not parse JSON of imported tools", json, ex);
      }
    }
  };

  handleExport = () => {
    clipboard.writeText(JSON.stringify(this.state.customTools));
    this.setState({
      ...this.state,
      addToolsOpen: false,
    });
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
                <div className={styles["button"]} onClick={this.handleImport}>
                  Import
                </div>
                <div className={styles["button"]} onClick={this.handleExport}>
                  Export All
                </div>
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
            <img src={logo} alt={""} />
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
