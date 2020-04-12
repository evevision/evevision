import React, {useEffect} from 'react';
import {Panel, WindowButtons} from '../ui/Layout';
import {Button} from '../ui/Input';
import {ipcRenderer} from "electron";

const Settings = () => {
    useEffect(() => {
        document.title = "Settings"
    })
    return (
        <>
            <Panel>
                <Button onClick={() => ipcRenderer.send("clearPositionStore")}>Reset Saved Window Positions</Button>
            </Panel>
            <WindowButtons>
                <Button onClick={() => {
                    window.close()
                }}>Close</Button>
            </WindowButtons>
        </>
    );
}
export default Settings;
