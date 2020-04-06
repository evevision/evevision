import React, {Component} from 'react';
import {Panel, Typography} from '../ui/Layout';
import {Button} from '../ui/Input';
import {AppState} from "../store/rootReducer";
import {connect} from "react-redux";
import {CharacterEsiAuth, CharacterInfo} from "../store/characters/types";
import {deleteCharacterAuth} from "../store/characters/actions";
import Moment from "react-moment";
import ChildWindowContainer from "../containers/ChildWindowContainer";

interface AuthProps {
    character?: CharacterInfo
    auth?: CharacterEsiAuth
    characterId: number
    deleteCharacterAuth: typeof deleteCharacterAuth;
}

class Auth extends Component<AuthProps> {

    // we will re-enable these later when we actually use them
    // no point in asking for all this for a public release to EVE
    readonly scopes = [
        //"esi-characters.read_fatigue.v1",
        "esi-location.read_online.v1",
        //"esi-fittings.read_fittings.v1",
        //"esi-fittings.write_fittings.v1",
        //"esi-ui.open_window.v1",
        //"esi-ui.write_waypoint.v1",
        //"esi-fleets.read_fleet.v1",
        //"esi-fleets.write_fleet.v1",
        //"esi-killmails.read_killmails.v1",
        //"esi-skills.read_skillqueue.v1",
        //"esi-skills.read_skills.v1",
        //"esi-location.read_ship_type.v1",
        //"esi-location.read_location.v1",
        "publicData"
    ].join(" ")

    componentDidMount(): void {
        document.title = "ESI Authentication"
    }

    componentDidUpdate(prevProps: Readonly<AuthProps>) {
        if(prevProps.auth === undefined && this.props.auth !== undefined) {
            window.close();
        }
    }

    deauthorize = () => {
        this.props.deleteCharacterAuth(this.props.characterId);
    }

    render() {
        if(this.props.character === undefined || this.props.character.public === undefined) { return null }
        if(this.props.auth == undefined) {
            return (
                <>
                    <Panel>
                        <Typography>Please authorize EveVision to access ESI for <strong>{this.props.character.public.name}</strong></Typography>
                    </Panel>
                    <ChildWindowContainer url={"https://login.eveonline.com/oauth/authorize?response_type=code&redirect_uri=eveauth-evevision%3A%2F%2Fyeehaw%2F&client_id=98de84087ae042c9aaca2ce0491e1e92&scope=" + this.scopes}/>
                    <Panel>
                        <Typography><strong>Scroll down to authorize.</strong> Note that for your capsuleer's safety, your ESI refresh token is never transmitted. It is stored locally and is used only while EveVision is open. This means EveVision will only be able to access your data for up to 20 minutes after you log out. </Typography>
                    </Panel>
                </>
            )
        } else {
            return (
                <Panel>
                    <h3>Refreshing ESI access token <Moment fromNow interval={500} date={this.props.auth.expiresAt - (5*60 * 1000) + 1000} /></h3>
                    <Button onClick={this.deauthorize}>Disconnect ESI</Button>
                    <br />
                    <br />
                    <Typography>You may remove EveVision's ESI access at any time, but you will lose access to the EveVision servers and thus many of your tools. You will be able to sign in again whenever you are ready.</Typography>
                    <br />
                    <Typography>Note that for your capsuleer's safety, your ESI refresh token is never transmitted. It is stored locally and is used only while EveVision is open. This means EveVision will only be able to access your data for up to 20 minutes after you log out. However, as of this version your data is not accessed whatsoever while you are offline.</Typography>
                </Panel>
            )
        }

    }
}

const mapStateToProps = (state: AppState, ownProps: AuthProps) => {
    const character = state.characters.characters.find(c => c.id == ownProps.characterId)
    if(character !== undefined) {
        return {character, auth: character.auth}
    } else {
        return {}
    }

}

export default connect(
    mapStateToProps,
    {deleteCharacterAuth}
)(Auth)