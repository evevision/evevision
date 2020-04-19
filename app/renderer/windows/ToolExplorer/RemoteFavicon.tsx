import React, { Component } from "react";
import styles from "./FavoritesMenu.scss";
import { IpcRendererEvent, ipcRenderer } from "electron";

interface RemoteFaviconProps {
  url: string;
  size: number;
}

interface RemoteFaviconState {
  url?: string;
}

class RemoteFavicon extends Component<RemoteFaviconProps, RemoteFaviconState> {
  state: RemoteFaviconState = {};

  handleFavIcon = (
    _event: IpcRendererEvent,
    url: string,
    sourceUrl: string
  ) => {
    if (sourceUrl === this.props.url) {
      this.setState({ url });
    }
  };

  componentDidMount(): void {
    ipcRenderer.on("resolveFavIcon", this.handleFavIcon);
    ipcRenderer.send("resolveFavIcon", this.props.url);
  }

  componentWillUnmount(): void {
    ipcRenderer.removeListener("resolveFavIcon", this.handleFavIcon);
  }

  render() {
    return (
      <div
        className={styles["icon"]}
        style={{
          backgroundImage:
            "url(" +
            (this.state.url
              ? this.state.url
              : "https://eveonline.com/favicon.ico") +
            ")",
          width: this.props.size,
          height: this.props.size,
          backgroundSize: this.props.size
        }}
      ></div>
    );
  }
}
export default RemoteFavicon;
