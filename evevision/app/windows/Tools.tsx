import React, {Component} from 'react';
import {Panel, Typography} from '../ui/Layout';
import {Button} from '../ui/Input';
import {ipcRenderer} from "electron"
import {AppState} from "../store/rootReducer";
import {connect} from "react-redux";
import {CharacterInfo} from "../store/characters/types";

interface ToolsProps {
    character?: CharacterInfo
    characterId: number // TODO: find a way to not have to pass this around
}

interface ToolsState {
}

// this is obviously very temporary. the goal for the future is to have plugins for everybody, including panfam, and not have it be part of the core app.
const panfam = [
    386292982, // pandemic legion
    99005338, // pandemic horde
    1727758877, // northern coalition
    99008788, // the skeleton crew
    99007707, // damned brotherhood
    933731581, // triumvirate
    99009289, // reckless contingency
    99009310, // veni vidi vici
    99002003, // no value
    99009275, // the stars of northern moon
    1042504553, // slyce
]

class Tools extends Component<ToolsProps, ToolsState> {

    constructor(props: ToolsProps) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        document.title = "Tools"
    }

    render() {
        if(this.props.character === undefined || this.props.character.public === undefined) {
            return (
                <Panel>
                    <Typography>Loading character info..</Typography>
                </Panel>
            )
        } else {
            return (
                <Panel>
                    <h3>Generic</h3>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://google.com/");
                    }}>Google</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://duckduckgo.com/");
                    }}>DuckDuckGo</Button>
                    <br/>
                    <br/>
                    {
                        panfam.includes(this.props.character.public.alliance_id!) ? <>
                            <h3>Horde Services</h3>
                            <Button onClick={() => {
                                ipcRenderer.send("openWindow", "externalsite", "https://www.pandemic-horde.org/");
                            }}>Square</Button>
                            <Button onClick={() => {
                                ipcRenderer.send("openWindow", "externalsite", "https://pgsus.space/");
                            }}>Penny's Flying Circus</Button>
                            <Button onClick={() => {
                                ipcRenderer.send("openWindow", "externalsite", "http://qymm.space/");
                            }}>Qymm's Maps</Button>
                            <br/><br/>
                        </> : ""
                    }

                    <h3>Industry</h3>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://evemarketer.com/");
                    }}>EveMarketer</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://janice.e-351.com/");
                    }}>Janice Junk Evaluator</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://evepraisal.com/");
                    }}>Evepraisal</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://ore.cerlestes.de/ore");
                    }}>Ore Tables</Button>
                    <br/><br/><h3>Communication</h3>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://translate.google.com/");
                    }}>Google Translate</Button>

                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://www.deepl.com/en/translator");
                    }}>DeepL Translate</Button>

                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://discordapp.com/app");
                    }}>Discord</Button>
                    <br/><br/><h3>Exploration</h3>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://evemaps.dotlan.net/");
                    }}>Dotlan</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://eveeye.com/");
                    }}>EveEye</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://dscan.info/");
                    }}>DScan</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://tripwire.eve-apps.com/");
                    }}>Tripwire</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://www.eve-scout.com/thera/map/");
                    }}>Thera Map</Button>
                    <br/><br/><h3>Info</h3>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://zkillboard.com/character/" + this.props.character!.id);
                    }}>ZKillboard</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://evewho.com/");
                    }}>EVEWho</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://wiki.eveuniversity.org/");
                    }}>EVE University</Button>
                    <br/><br/><h3>Entertainment</h3>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://www.youtube.com/");
                    }}>Youtube</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://www.soundcloud.com/");
                    }}>SoundCloud</Button>
                    <Button onClick={() => {
                        ipcRenderer.send("openWindow", "externalsite", "https://reddit.com/r/eve");
                    }}>Reddit</Button>
                </Panel>
            );
        }
    }
}

const mapStateToProps = (state: AppState, ownProps: ToolsProps) => {
    const character = state.characters.characters.find(c => c.id == ownProps.characterId)
    if(character !== undefined) {
        return {character}
    } else {
        return {}
    }
}

export default connect(
    mapStateToProps
)(Tools)