import React from 'react';
import {Panel} from '../ui/Layout';
import ChildWindowContainer from "../containers/ChildWindowContainer";

const Ricardo = () => {
    return (
        <Panel>
            <ChildWindowContainer url={"https://www.youtube.com/embed/T1LqYfgb6EY?autoplay=1&repeat=1"}/>
        </Panel>
    )
}

export default Ricardo;
