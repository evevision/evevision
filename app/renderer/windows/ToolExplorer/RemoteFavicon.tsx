import React, { Component } from "react";
import styles from "./FavoritesMenu.scss";
import { ipcRenderer } from "electron";

interface RemoteFaviconProps {
  url: string;
  size: number;
}

interface RemoteFaviconState {
  url?: string;
}

class RemoteFavicon extends Component<RemoteFaviconProps, RemoteFaviconState> {
  state: RemoteFaviconState = {};

  componentDidMount(): void {
    ipcRenderer
      .invoke("resolveFavIcon", this.props.url)
      .then((url) => {
        this.setState({ url });
      })
      .catch((err) =>
        console.error("Error retrieving favicon", this.props.url, err)
      );
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
          backgroundSize: this.props.size,
        }}
      ></div>
    );
  }
}
export default RemoteFavicon;
