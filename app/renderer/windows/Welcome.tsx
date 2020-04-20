import React, { Component } from "react";
import { Panel, Typography, WindowButtons } from "../ui/Layout";
import { Button } from "../ui/Input";
import { ipcRenderer } from "electron";
import { updateCharacterPublicInfo } from "../../shared/store/characters/actions";
import { AppState } from "../../shared/store/rootReducer";
import { connect } from "react-redux";
import {
  ApiConnectionStatus,
  ApiState,
  CharacterEsiAuth,
  CharacterInfo
} from "../../shared/store/characters/types";
import superagent from "superagent";
import { version } from "../../../package.json";

interface WelcomeProps {
  updateCharacterPublicInfo: typeof updateCharacterPublicInfo;
  character?: CharacterInfo;
  characterId: number;
  auth?: CharacterEsiAuth;
  apiState?: ApiState;
}

interface WelcomeState {
  newVersion?: string; // version number if available
}

const beans: {
  [key: string]: string;
} = {
  1354830081: "gsf",
  99003581: "frat",
  98437227: "bbz", // banished braindead zombies, horde member corp
  99005338: "horde",
  498125261: "test",
  1727758877: "nc",
  98148549: "capf",
  98431483: "innerhell",
  99007237: "lazerhawks",
  99004344: "holecontrol",
  99005065: "hardknocks",
  99009082: "mango",
  109299958: "ccp",
  924269309: "ccp", // ISD
  98075603: "ccp", // ISD CCL
  99004425: "bastion",
};

class Welcome extends Component<WelcomeProps, WelcomeState> {
  versionCheckTimer?: NodeJS.Timeout;

  constructor(props: WelcomeProps) {
    super(props);
    this.state = {};
  }

  // honestly this should just be done in the main process but it's all gonna be replaced by an autoupdater anyways
  checkForLatestVersion = () => {
    superagent
      .get("http://releases.eve.vision.s3-website.us-east-2.amazonaws.com/")
      .then(res => {
        if (res.text !== version) {
          this.setState({ newVersion: res.text });
        }
      })
      .catch(err => {
        console.error("Failed to retrieve latest EveVision version", err);
      });
  };

  componentDidMount() {
    // go ahead and update this character's data
    this.props.updateCharacterPublicInfo(this.props.characterId);
    document.title = "EveVision " + version;
    this.versionCheckTimer = setInterval(
      this.checkForLatestVersion,
      15 * 60 * 1000
    ); // every 15 minutes
    this.checkForLatestVersion();
  }

  componentWillUnmount(): void {
    if (this.versionCheckTimer) {
      clearInterval(this.versionCheckTimer);
    }
  }

  apiStateText() {
    if (this.props.apiState === undefined) {
      return null;
    }
    switch (this.props.apiState.status) {
      case ApiConnectionStatus.DISCONNECTED:
        return "";
      case ApiConnectionStatus.CONNECTING:
        return "Connecting to api.eve.vision";
      case ApiConnectionStatus.CONNECTED:
        return "Connected to api.eve.vision";
    }
  }

  bean() {
    if (!this.props.character || !this.props.character.public) {
      return "";
    }
    let corporationId = this.props.character.public.corporation_id;
    let allianceId = this.props.character.public.alliance_id;

    if (corporationId in beans) {
      return <div className={"eve-welcome-bean " + beans[corporationId]}></div>;
    } else if (allianceId && allianceId in beans) {
      return <div className={"eve-welcome-bean " + beans[allianceId]}></div>;
    } else {
      return "";
    }
  }
  render() {
    if (
      this.props.character === undefined ||
      this.props.character.public === undefined
    ) {
      return (
        <>
          <Panel>
            <Typography>Loading character info..</Typography>
          </Panel>
          <WindowButtons>
            <Button
              onClick={() => {
                ipcRenderer.send("openWindow", "about");
              }}
            >
              About
            </Button>
          </WindowButtons>
        </>
      );
    } else {
      return (
        <>
          {this.bean()}
          <Panel>
            <Typography>
              <h2 style={{ textAlign: "right", marginLeft: "150px" }}>
                Welcome to EveVision,
                <br />
                {this.props.character.public.name}.
              </h2>
              <br />
              {this.state.newVersion ? (
                <div className={"new-version-alert"}>
                  <strong>Version {this.state.newVersion} available!</strong>
                </div>
              ) : null}
            </Typography>
          </Panel>
          <WindowButtons>
            <Button
              onClick={() => {
                ipcRenderer.send("openWindow", "toolexplorer");
              }}
            >
              Tool Explorer
            </Button>
            <Button
              onClick={() => {
                ipcRenderer.send("openWindow", "settings");
              }}
            >
              Settings
            </Button>
            <Button
              onClick={() => {
                ipcRenderer.send("openWindow", "jukebox");
              }}
            >
              Jukebox
            </Button>
            {this.props.character.public.corporation_id === 98148549 ? (
              <Button
                onClick={() => {
                  ipcRenderer.send("openWindow", "ricardo");
                }}
              >
                Morale Boost
              </Button>
            ) : (
              ""
            )}
            <Button
              onClick={() => {
                ipcRenderer.send("openWindow", "about");
              }}
            >
              About
            </Button>
          </WindowButtons>
        </>
      );
    }
  }
}

const mapStateToProps = (state: AppState, ownProps: WelcomeProps) => {
  const character = state.characters.characters.find(
    c => c.id === ownProps.characterId
  );
  if (character !== undefined) {
    return { character, auth: character.auth, apiState: character.apiState };
  } else {
    return {};
  }
};

export default connect(mapStateToProps, {
  updateCharacterPublicInfo: updateCharacterPublicInfo
})(Welcome);
