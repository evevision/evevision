import React, {useEffect} from 'react';
import {Panel} from '../ui/Layout';
import {Button} from '../ui/Input';
import { ipcRenderer } from "electron"

const Tools = () => {
  useEffect(() => {
    document.title = "Tools"
  })
  return (
      <Panel>
        <h3>Generic</h3>
        <Button onClick={() => {
          ipcRenderer.send("openWindow", "externalsite", "https://google.com/");
        }}>Google</Button>
          <br/>
          <br/>
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
        <br/><br/><h3>Industry</h3>
        <Button onClick={() => {
          ipcRenderer.send("openWindow", "externalsite", "https://evemarketer.com/");
        }}>EveMarketer</Button>
        <Button onClick={() => {
          ipcRenderer.send("openWindow", "externalsite", "https://janice.e-351.com/");
        }}>Janice Junk Evaluator</Button>
        <Button onClick={() => {
          ipcRenderer.send("openWindow", "externalsite", "https://evepraisal.com/");
        }}>Evepraisal</Button>
        <br/><br/><h3>Communication</h3>
          <Button onClick={() => {
              ipcRenderer.send("openWindow", "externalsite", "https://translate.google.com/");
          }}>Google Translate</Button>
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
        <Button onClick={() => {
          ipcRenderer.send("openWindow", "externalsite", "http://jukebox.today/qymmbash");
        }}>Qymm's Jukebox</Button>
      </Panel>
  );
}

export default Tools;
