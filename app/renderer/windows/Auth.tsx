import React, { Component } from "react";
import { Panel, Typography } from "../ui/Layout";
import { AppState } from "../../shared/store/rootReducer";
import { connect } from "react-redux";
import {
  CharacterEsiAuth,
  CharacterInfo
} from "../../shared/store/characters/types";
import { deleteCharacterAuth } from "../../shared/store/characters/actions";
interface AuthProps {
  character?: CharacterInfo;
  auth?: CharacterEsiAuth;
  characterId: number;
  deleteCharacterAuth: typeof deleteCharacterAuth;
}

class Auth extends Component<AuthProps> {
  componentDidMount(): void {
    document.title = "ESI Authentication";
  }

  componentDidUpdate(prevProps: Readonly<AuthProps>) {
    if (prevProps.auth === undefined && this.props.auth !== undefined) {
      window.close();
    }
  }

  deauthorize = () => {
    this.props.deleteCharacterAuth(this.props.characterId);
  };

  render() {
    return (
      <Panel>
        <Typography>
          ESI Authentication is not a part of this release! It will be used in
          the future with the plugin system. You do not need to authorize with
          ESI to do anything at this time.
        </Typography>
      </Panel>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: AuthProps) => {
  const character = state.characters.characters.find(
    c => c.id === ownProps.characterId
  );
  if (character !== undefined) {
    return { character, auth: character.auth };
  } else {
    return {};
  }
};

export default connect(mapStateToProps, { deleteCharacterAuth })(Auth);
