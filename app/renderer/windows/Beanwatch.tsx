import React, { Component } from "react";
import { Panel, Typography } from "../ui/Layout";
import { AppState } from "../store/rootReducer";
import { connect } from "react-redux";
import { CharacterEsiAuth, CharacterInfo } from "../store/characters/types";

interface BeanwatchProps {
  character?: CharacterInfo;
  auth?: CharacterEsiAuth;
  characterId: number;
}

interface BeanwatchState {
  buttonClicks: number;
  panic: boolean;
  panicConfirmed: boolean;
  cancelling: boolean;
  buttonHovered: boolean;
}

class Beanwatch extends Component<BeanwatchProps, BeanwatchState> {
  constructor(props: BeanwatchProps) {
    super(props);
    this.state = {
      buttonClicks: 0,
      panic: false,
      panicConfirmed: false,
      cancelling: false,
      buttonHovered: false
    };
  }

  componentDidMount(): void {
    document.title = "Beanwatch";
  }

  sendPanicAlert = () => {
    setTimeout(() => {
      this.setState({ ...this.state, panicConfirmed: true });
    }, 2000);
  };

  cancelPanicAlert = () => {
    setTimeout(() => {
      this.setState({ ...this.state, cancelling: false });
    }, 2000);
  };

  click = () => {
    const newClicks = this.state.buttonClicks + 1;
    if (!this.state.panic && !this.state.cancelling) {
      // normal, not panicking or cancelling
      if (newClicks >= 3) {
        // we really set panicconfirmed/buttonhovered later. we set buttonhovered false so it shows the fleet alerted text when they first press it
        this.setState({
          ...this.state,
          buttonClicks: 0,
          panic: true,
          buttonHovered: false
        });
        this.sendPanicAlert();
      } else {
        this.setState({ ...this.state, buttonClicks: newClicks });
      }
    } else if (this.state.panic) {
      // currently panicking
      if (newClicks >= 2) {
        this.setState({
          ...this.state,
          buttonClicks: 0,
          cancelling: true,
          panic: false,
          panicConfirmed: false
        });
        this.cancelPanicAlert();
      } else {
        this.setState({ ...this.state, buttonClicks: newClicks });
      }
    } else {
      this.setState({ ...this.state, buttonClicks: newClicks });
    }
  };

  buttonText(): String {
    if (this.state.panic && !this.state.panicConfirmed) {
      return "ALERTING FLEET";
    } else if (this.state.panic && this.state.panicConfirmed) {
      switch (this.state.buttonClicks) {
        case 0:
          return this.state.buttonHovered ? "CANCEL?" : "FLEET EN ROUTE";
        case 1:
          return "CONFIRM CANCEL";
        default:
          return "YOU BROKE SOMETHING!";
      }
    } else if (this.state.cancelling) {
      return "SENDING ALL CLEAR";
    } else {
      switch (this.state.buttonClicks) {
        case 0:
          return "PANIC";
        case 1:
          return "CONFIRM";
        case 2:
          return "SOUND THE HORDE HORN?";
        default:
          return "YOU BROKE SOMETHING!";
      }
    }
  }

  buttonClass(): string {
    if (this.state.panic && !this.state.panicConfirmed) {
      return "eve-panic-button alerting";
    } else if (this.state.panic && this.state.panicConfirmed) {
      return "eve-panic-button confirmed";
    } else if (this.state.cancelling) {
      return "eve-panic-button cancelling";
    } else {
      return "eve-panic-button";
    }
  }

  mouseEnter = () => {
    this.setState({ ...this.state, buttonHovered: true });
  };

  mouseLeave = () => {
    this.setState({ ...this.state, buttonClicks: 0, buttonHovered: false });
  };

  render() {
    if (this.props.auth === undefined) {
      return (
        <>
          <Panel>
            <h4>ESI authorization required.</h4>
          </Panel>
        </>
      );
    } else {
      return (
        <>
          <div
            className={this.buttonClass()}
            onMouseLeave={this.mouseLeave}
            onMouseEnter={this.mouseEnter}
            onClick={this.click}
          >
            {this.buttonText()}
          </div>
          <Panel>
            <Typography>
              Beanwatch development is almost complete! Working out the politics
              and the ansiblex routing. Should be in the next release!
            </Typography>
          </Panel>
        </>
      );
    }
  }
}

const mapStateToProps = (state: AppState, ownProps: BeanwatchProps) => {
  const character = state.characters.characters.find(
    (c: any) => c.id === ownProps.characterId
  );
  if (character !== undefined) {
    return { character, auth: character.auth };
  } else {
    return {};
  }
};

export default connect(mapStateToProps, {})(Beanwatch);
