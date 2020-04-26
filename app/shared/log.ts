import log, { LogMessage, PathVariables } from "electron-log";
import path from "path";

log.transports.file.resolvePath = (
  variables: PathVariables,
  _?: LogMessage
): string => {
  return path.join(variables.appData, "EveVision", "logs", variables.fileName);
};

// Override console.log for everything to redirect to the file logs
Object.assign(console, log.functions);

export default log;
