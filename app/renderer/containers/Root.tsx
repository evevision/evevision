import React from "react";
import About from "../windows/About";
import Welcome from "../windows/Welcome";
import Beanwatch from "../windows/Beanwatch";
import Settings from "../windows/Settings";
import Jukebox from "../windows/Jukebox";
import { hot } from "react-hot-loader/root";
import store from "../store";
import { Provider } from "react-redux";
import Auth from "../windows/Auth";
import ExternalSite from "../windows/ExternalSite";
import FSORoot from "../FSORoot";
import { ipcRenderer } from "electron";
import { Window } from "../ui/Window";
import Ricardo from "../windows/Ricardo";
import ToolExplorer from "../windows/ToolExplorer";
import ReactTooltip from "react-tooltip";
import tooltipStyle from "../tooltip.scss";
import Terminal from "../windows/Terminal";

function renderWindowContents(
  characterId: number,
  windowName: string,
  itemId: string
) {
  // argv values are objects, not strings

  switch (windowName) {
    case "about":
      return <About />;
    case "welcome":
      return <Welcome characterId={characterId} />;
    case "beanwatch":
      return <Beanwatch characterId={characterId} />;
    case "settings":
      return <Settings characterId={characterId} />;
    case "auth":
      return <Auth characterId={characterId} />;
    case "externalsite":
      return <ExternalSite url={itemId} />;
    case "ricardo":
      return <Ricardo />;
    case "jukebox":
      return <Jukebox />;
    case "toolexplorer":
      return <ToolExplorer />;
    case "terminal":
      return <Terminal />;
    default:
      return <>UNKNOWN WINDOW {windowName}</>;
  }
}

const onRequestClose = () => {
  ipcRenderer.send("closeMe");
};

const onRequestMinimize = () => {
  ipcRenderer.send("minimizeMe");
};

function Root() {
  const args = window.process.argv.slice(-4);
  const characterIdStr = args[0];
  const windowName = args[1];
  const itemId = atob(args[2]);
  const isClosable = args[3] === "true";
  const characterId = Number(characterIdStr);
  const windowContents = renderWindowContents(characterId, windowName, itemId);

  if (windowName === "fullscreenoverlay") {
    return (
      <Provider store={store}>
        <ReactTooltip
          multiline={true}
          effect={"solid"}
          arrowColor={"black"}
          class={tooltipStyle["tooltip"]}
        />
        <FSORoot characterId={characterId} />
      </Provider>
    );
  } else {
    if (isClosable) {
      return (
        <Provider store={store}>
          <ReactTooltip
            multiline={true}
            effect={"solid"}
            arrowColor={"black"}
            class={tooltipStyle["tooltip"]}
          />
          <Window
            onRequestMinimize={onRequestMinimize}
            onRequestClose={onRequestClose}
          >
            {windowContents}
          </Window>
        </Provider>
      );
    } else {
      return (
        <Provider store={store}>
          <ReactTooltip
            multiline={true}
            effect={"solid"}
            arrowColor={"black"}
            class={tooltipStyle["tooltip"]}
          />
          <Window onRequestMinimize={onRequestMinimize}>
            {windowContents}
          </Window>
        </Provider>
      );
    }
  }
}

export default hot(Root);
