import * as logFromLogLevel from "loglevel";

const log = logFromLogLevel;
export const setLogLevel = (level: logFromLogLevel.LogLevelDesc) => {
  log.setLevel(level);
};
setLogLevel("warn");

export default log;
