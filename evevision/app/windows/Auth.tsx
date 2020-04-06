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
        return <Panel><Typography>ESI Authentication is not a part of this release! It will be used in the future with the plugin system. You do not need to authorize with ESI to do anything at this time.</Typography></Panel>
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