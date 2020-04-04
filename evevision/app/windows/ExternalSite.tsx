import React, {useEffect} from 'react';
import {Panel} from '../ui/Layout';
import ChildWindowContainer from "../containers/ChildWindowContainer";

type Props = {
    url: string
}

const ExternalSite = ({url}: Props) => {
    return (
        <Panel>
            <ChildWindowContainer url={url}/>
        </Panel>
    )
}

export default ExternalSite;
