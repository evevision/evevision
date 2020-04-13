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
              <Typography>
                  <h1 style={{textAlign: 'center'}}>EveVision</h1>
                  <h4 style={{textAlign: 'center'}}>{version}</h4><br />
                  <h2 style={{textAlign: 'center'}}>This tool is not endorsed by CCP.</h2><br />
                  <div style={{textAlign: 'center'}}>
                      This software is licensed under the GPLv3 license.<br />
                      You can download the source code and new releases from <a href={"https://github.com/evevision/evevision"} target={"_blank"}>https://github.com/evevision/evevision</a>.<br />
                      For support, please visit our Discord channel at <a href={"https://discord.gg/BBBJRkM"} target={"_blank"}>https://discord.gg/BBBJRkM</a>.<br />
                      ISK Donations are accepted to the ingame character <strong>EveVision</strong>.
                  </div><br />
              </Typography><br />
              <Typography>
                  <h1>Credits</h1><br/>
                  <h4>Jaydubs - Creator & Maintainer</h4>
                  <h4>Niedar - Jukebox</h4>
                  <h4>Eris Kirke - Build scripts</h4><br />
                  Thanks to CCP for allowing a tool like this to exist and giving us APIs to interact with our favorite game. Your neverending support of the developer community is forever appreciated.
              </Typography><br /><br/>
              <Typography>
                  <h1 style={{textAlign: 'center'}}>Special thanks to Patreon donators!</h1>
                  <h4 style={{textAlign: 'center'}}>You can donate at <a href={"https://patreon.com/evevision"} target={"_blank"}>https://patreon.com/evevision</a> to get your character name here <strong>forever.</strong></h4><br/><br/>
                  <h1 style={{textAlign: 'center', textDecoration: 'underline'}}>Deadspace Capsuleers</h1>
                  <h2 style={{textAlign: 'center', fontWeight: 'normal'}}>Mr. Helious Jin-Mei & Mrs. Wheezy Garlic of Northern Coalition.</h2>
                  <br />
                  <h2 style={{textAlign: 'center', textDecoration: 'underline'}}>Golden Capsuleers</h2>
                  <h3  style={{textAlign: 'center', fontWeight: 'normal'}}>Sonya Rovana of Capital Fusion</h3>
                  <br />
                  <h3 style={{textAlign: 'center', textDecoration: 'underline'}}>Silver Capsuleers</h3>
                  <h4 style={{textAlign: 'center', fontWeight: 'normal'}}>Andres M Afanador of DICE / Inner Hell</h4>
              </Typography><br/>

            </Panel>
            <WindowButtons>
              <Button onClick={() => {window.close()}}>Close</Button>
            </WindowButtons>
        </>
    );
}

export default About;
