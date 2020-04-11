import React, {Component} from 'react';
import {ipcRenderer} from 'electron';
const log = require('electron-log');

interface ChildWindowContainerProps {
    url: string
}

interface ChildWindowContainerState {
    lastUpdate: number
}


class ChildWindowContainer extends Component<ChildWindowContainerProps, ChildWindowContainerState> {
    containerRef: any;

    constructor(props: ChildWindowContainerProps) {
        super(props)
        this.containerRef = React.createRef();
        this.state = {lastUpdate: 0}
    }

    updateDimensions = () => {
        //if((Date.now() - this.state.lastUpdate) > 1000) {
            const bounds = this.containerRef.current.getBoundingClientRect()
            ipcRenderer.send("positionChildWindow", bounds.x, bounds.y, Math.ceil(bounds.width), Math.ceil(bounds.height))
            //this.setState({lastUpdate: Date.now()});
        //}
    }

    componentDidMount(): void {
        setImmediate(() => {
            // try pushing it into the next event tick.
            // not sure why, but sometimes the childwindow initializes with the wrong height.
            const bounds = this.containerRef.current.getBoundingClientRect();
            log.info("Initializing child window with dimensions " + Math.ceil(bounds.width) + "x" + Math.ceil(bounds.height))
            ipcRenderer.send("createChildWindow", this.props.url, bounds.x, bounds.y, Math.ceil(bounds.width), Math.ceil(bounds.height))
        })
        window.addEventListener("resize", this.updateDimensions)
    }

    componentWillUnmount(): void {
        ipcRenderer.send("removeChildWindow")
        window.removeEventListener("resize", this.updateDimensions)
    }

    render() {
        return (
            <div className={"child-window-container"} ref={this.containerRef}></div>
        )
    }

}

export default ChildWindowContainer;