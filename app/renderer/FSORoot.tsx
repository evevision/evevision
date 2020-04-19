import React, { Component } from "react";
import { AppState } from "../store/rootReducer";
import { connect } from "react-redux";
import OverlayMenu from "./components/OverlayMenu";
import RicardoOverlay from "./components/RicardoOverlay";
import { faWindowRestore, faStar } from "@fortawesome/free-solid-svg-icons";
import MinimizedWindowMenu from "./components/MinimizedWindowMenu";
import FavoritesMenu from "./windows/ToolExplorer/FavoritesMenu";

interface OverlayProps {
  characterId: number;
}

interface OverlayState {}

class FSORoot extends Component<OverlayProps, OverlayState> {
  constructor(props: OverlayProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="eve-overlay">
        <OverlayMenu
          characterId={this.props.characterId}
          icon={faWindowRestore}
          positionKey={"windows"}
          defaultPosition={{ right: 100, bottom: 10 }}
          tooltip={
            "Minimized Windows<br />Click, hold, and drag to reposition."
          }
        >
          <MinimizedWindowMenu />
        </OverlayMenu>

        <OverlayMenu
          characterId={this.props.characterId}
          icon={faStar}
          positionKey={"favorites"}
          defaultPosition={{ right: 150, bottom: 10 }}
          tooltip={"Favorite Tools<br />Click, hold, and drag to reposition."}
        >
          <FavoritesMenu />
        </OverlayMenu>
        <RicardoOverlay />
      </div>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OverlayProps) => {
  return {};
};

export default connect(mapStateToProps, {})(FSORoot);
