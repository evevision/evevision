import React, { Component } from "react";
import { AppState } from "../store/rootReducer";
import { connect } from "react-redux";
import OverlayMenu from "./components/OverlayMenu";
import RicardoOverlay from "./components/RicardoOverlay";

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
        <OverlayMenu characterId={this.props.characterId} />
        <RicardoOverlay />
      </div>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: OverlayProps) => {
  return {};
};

export default connect(mapStateToProps, {})(FSORoot);
