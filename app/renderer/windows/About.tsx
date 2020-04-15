import React, {useEffect} from 'react';
import {Panel, Typography, WindowButtons} from '../ui/Layout';
import {Button} from '../ui/Input';

import hordelogo from '../images/hordelogo.png';
import {version} from '../../../package.json';

const About = () => {
    useEffect(() => {
        document.title = "About"
    })
    return (
        <>
            <Panel>
                <div className={"eve-credits-container eve-scrollbar"}>
                  <Typography>
                      <h1 style={{textAlign: 'center'}}>EveVision</h1>
                      <h4 style={{textAlign: 'center'}}>{version}</h4><br />
                      <h2 style={{textAlign: 'center'}}>This tool is not endorsed or approved by CCP.</h2>
                      <div style={{textAlign: 'center'}}>
                          This software is licensed under the GPLv3 license.<br />
                          You can download the source code and new releases from <a href={"https://github.com/evevision/evevision"} target={"_blank"}>https://github.com/evevision/evevision</a>.<br />
                          For support, please visit our Discord channel at <a href={"https://discord.gg/wWMasVf"} target={"_blank"}>https://discord.gg/BBBJRkM</a>.<br />
                          <br/>ISK Donations are accepted to the ingame character <strong>EveVision</strong>.<br/>
                      </div><br />
                  </Typography><br />
                  <Typography>
                      <h1>Credits</h1><br/>
                      Special thanks to CCP for allowing a tool like this to exist and giving us APIs to interact with our favorite game. Your neverending support of the developer community is forever appreciated.
                      <br />
                      <br />
                      <h1>EveVision Contributors</h1>
                      <h2>Core</h2>
                      <hr />
                      <table className={"eve-credits"}>
                          <tr>
                              <td>Creator & Maintainer :</td>
                              <td>Jaydubs</td>
                          </tr>
                          <tr>
                              <td>Jukebox :</td>
                              <td>Niedar</td>
                          </tr>
                          <tr>
                              <td>Non-English Community Relations :</td>
                              <td>Andres M Afanador</td>
                          </tr>
                          <tr>
                              <td>Various Repo Contributions :</td>
                              <td>Eris Kirke, Hitoru Okasaki</td>
                          </tr>
                      </table>
                      <h2>External Tools</h2>
                      <hr/>
                      <table className={"eve-credits"}>
                          <tr>
                              <td>Fuzzwork :</td>
                              <td>Steve Ronuken</td>
                          </tr>
                          <tr>
                              <td>EveMarketer :</td>
                              <td>Aplulu</td>
                          </tr>
                          <tr>
                              <td>Janice Junk Evaluator :</td>
                              <td>Eris Kirke (E-351)</td>
                          </tr>
                          <tr>
                              <td>Evepraisal :</td>
                              <td>sudorandom</td>
                          </tr>
                          <tr>
                              <td>Ore Tables :</td>
                              <td>cerlestes</td>
                          </tr>
                          <tr>
                              <td>Abyssal Markets :</td>
                              <td>Sharad Heft</td>
                          </tr>
                          <tr>
                              <td>EVE-Mogul :</td>
                              <td>Jeronica</td>
                          </tr>
                          <tr>
                              <td>Dotlan :</td>
                              <td>Daniel Hoffend</td>
                          </tr>
                          <tr>
                              <td>EveEye Explorer :</td>
                              <td>Risingson</td>
                          </tr>
                          <tr>
                              <td>Tripwire :</td>
                              <td>Daimian Mercer</td>
                          </tr>
                          <tr>
                              <td>Eve-Scout Thera Maps :</td>
                              <td>Signal Cartel</td>
                          </tr>
                          <tr>
                              <td>Siggy :</td>
                              <td>borkedLabs</td>
                          </tr>
                          <tr>
                              <td>Anoikis :</td>
                              <td>Eric Wastl</td>
                          </tr>
                          <tr>
                              <td>ZKillboard / EVEWho :</td>
                              <td>Squizz Caphinator</td>
                          </tr>
                          <tr>
                              <td>Tripwire :</td>
                              <td>Daimian Mercer</td>
                          </tr>


                      </table>
                      <h2>Translations</h2>
                      <hr />
                      <table className={"eve-credits"}>
                          <tr>
                              <td>русский :</td>
                              <td><strong>Mortis en Divalone</strong> of <strong>Inner Hell</strong>, <strong>Mist Amatin</strong> of <strong>Arctic Beans</strong></td>
                          </tr>
                          <tr>
                              <td>Español :</td>
                              <td><strong>DR4GONS</strong> of <strong>Anoikis</strong></td>
                          </tr>
                      </table>
                      <br />
                      <h2>Patreon Donators</h2>
                      <hr/>
                      <h4>You can donate at <a href={"https://patreon.com/evevision"} target={"_blank"}>https://patreon.com/evevision</a> to get your character name here <strong>forever.</strong></h4><br/><br/>
                      <h1 style={{textAlign: 'center', fontWeight: 'normal', textShadow: '0px 2px 2px red'}}>Mr. Helious Jin-Mei & Mrs. Wheezy Garlic of Northern Coalition.</h1>
                      <br />
                      <h2  style={{textAlign: 'center', fontWeight: 'normal', textShadow: '0px 2px 2px gold'}}>Sonya Rovana of Capital Fusion</h2>
                      <br />
                      <h4 style={{textAlign: 'center', fontWeight: 'normal', textShadow: '0px 2px 2px silver'}}>Andres M Afanador of DICE / Inner Hell</h4>
                    </Typography>
                  </div>
                </Panel>
                <WindowButtons>
                  <Button onClick={() => {window.close()}}>Close</Button>
                </WindowButtons>
        </>
    );
}

export default About;
