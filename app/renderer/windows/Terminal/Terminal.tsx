import React, { ReactText } from "react";
import styles from "./Terminal.scss";
import { Term } from "@dash4/react-xterm";
import { IPty } from "node-pty";

const pty = require("electron").remote.require("node-pty");

class Terminal extends React.PureComponent<{}, {}> {
  uid: string;
  term?: Term | null;
  pty?: IPty;

  constructor(props: {}) {
    super(props);
    this.uid =
      Math.random().toString(36).substring(2, 6) +
      Math.random().toString(36).substring(2, 6);
  }

  handlePtyData = (data: string) => {
    if (this.term) {
      this.term.write(data);
    }
  };

  handlePtyExit = () => {
    window.close();
  };

  updateDimensions = () => {
    if (this.term) {
      this.term.fitResize();
    }
  };

  componentDidMount() {
    document.title = "Windows Powershell";
    window.addEventListener("resize", this.updateDimensions);
    this.pty = pty.spawn("powershell.exe", [], {
      name: "xterm-color",
      cols: 80,
      rows: 10,
      cwd: process.env.HOME,
    });
    if (this.pty) {
      this.pty.on("data", this.handlePtyData);
      this.pty.on("exit", this.handlePtyExit);
    }
  }

  componentWillUnmount(): void {
    if (this.pty) {
      this.pty.kill();
    }
    window.removeEventListener("resize", this.updateDimensions);
  }

  handleTermRef = (id: ReactText, xterm: Term | null) => {
    this.term = xterm;
  };

  handleTermData = (...args: any[]): void => {
    if (this.pty) {
      args.forEach((arg) => this.pty!.write(arg));
    }
  };

  handleTermResize = (...args: any[]): void => {
    if (this.pty) {
      this.pty.resize(args[0], args[1]);
    }
  };

  render() {
    return (
      <div className={styles["container"]}>
        <Term
          ref_={this.handleTermRef}
          uid={this.uid}
          onData={this.handleTermData}
          onResize={this.handleTermResize}
        />
      </div>
    );
  }
}
export default Terminal;
