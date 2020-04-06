import React, {useEffect} from 'react';
import {Panel, Typography, WindowButtons} from '../ui/Layout';
import {Button} from '../ui/Input';

import hordelogo from '../images/hordelogo.png';
const { version } = require('../package.json');

const About = () => {
    useEffect(() => {
        document.title = "About"
    })
    return (
        <>
            <Panel>
              <Typography><h2>EveVision {version}</h2></Typography>

              <img src={hordelogo} class="hordelogo"/>
              <Typography>Developed by Jaydubs, with love.</Typography><br />
              <Typography>Source code and new releases are made available at https://github.com/evevision/evevision</Typography><br/>
              <Typography><strong>Fly without fear, capsuleer.</strong></Typography>
            </Panel>
            <WindowButtons>
              <Button onClick={() => {window.close()}}>Close</Button>
            </WindowButtons>
        </>
    );
}

export default About;
