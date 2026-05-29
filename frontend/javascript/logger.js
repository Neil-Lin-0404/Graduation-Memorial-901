import { config } from "./config.js";

const LEVEL_WEIGHT = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

function shouldLog(level) {
  const cur = LEVEL_WEIGHT[config.logLevel] ?? LEVEL_WEIGHT.info;
  const next = LEVEL_WEIGHT[level] ?? LEVEL_WEIGHT.info;
  return next >= cur;
}

function prefix(scope) {
  const ts = new Date().toISOString();
  return `[${config.appName}] ${ts} ${scope}`;
}

export function createLogger(scope) {
  const s = typeof scope === "string" && scope.length ? scope : "app";

  return {
    debug(...args) {
      if (!shouldLog("debug")) return;
      console.debug(prefix(s), ...args);
    },
    info(...args) {
      if (!shouldLog("info")) return;
      console.info(prefix(s), ...args);
    },
    warn(...args) {
      if (!shouldLog("warn")) return;
      console.warn(prefix(s), ...args);
    },
    error(...args) {
      if (!shouldLog("error")) return;
      console.error(prefix(s), ...args);
    },
  };
}
