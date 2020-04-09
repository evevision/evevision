import React, {useEffect} from 'react';
import {Panel, Typography, WindowButtons} from '../ui/Layout';
import {Button} from '../ui/Input';

import hordelogo from '../images/hordelogo.png';
import {version} from '../package.json';

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
                      For support, please visit our Discord channel at <a href={"https://discord.gg/BBBJRkM"} target={"_blank"}>https://discord.gg/BBBJRkM</a>.
                  </div><br />
              </Typography><br />
              <Typography>
                  <h1>Credits</h1><br/>
                  <h4>Jaydubs - Creator & Maintainer</h4>
                  Special thanks to CCP for making an awesome game where you can build tools with an API.
              </Typography><br /><br/>
              <Typography>
                  <h1>Special thanks to Patreon donators!</h1>
                  You can donate at <a href={"https://patreon.com/evevision"} target={"_blank"}>https://patreon.com/evevision</a> to get your character name here <strong>forever.</strong><br/><br/>
                  <h3>Deadspace Capsuleers:</h3>
                  <strong>Mr. Helious Jin-Mei & Mrs. Wheezy Garlic</strong> of <strong>Northern Coalition.</strong><br />
                  <br />
                  <h3>Bronze Capsuleers:</h3>
                  <strong>Andres M Afanador</strong>
              </Typography><br/>

            </Panel>
            <WindowButtons>
              <Button onClick={() => {window.close()}}>Close</Button>
            </WindowButtons>
        </>
    );
}

export default About;
