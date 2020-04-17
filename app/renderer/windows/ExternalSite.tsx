import React, { useEffect, useState } from "react";
import { Panel } from "../ui/Layout";
import ChildWindowContainer from "../containers/ChildWindowContainer";
import { ipcRenderer, IpcRendererEvent } from "electron";

type Props = {
  url: string;
};

const ExternalSite = ({ url }: Props) => {
  const [secure, setSecure] = useState(false);

  useEffect(() => {
    const onSetSecure = (event: IpcRendererEvent, secure: boolean) => {
      setSecure(secure);
    };
    ipcRenderer.on("setSecure", onSetSecure);
    return () => {
      ipcRenderer.removeListener("setSecure", onSetSecure);
    };
  });

  return (
    <Panel secure={secure}>
      <ChildWindowContainer url={url} />
    </Panel>
  );
};

export default ExternalSite;
