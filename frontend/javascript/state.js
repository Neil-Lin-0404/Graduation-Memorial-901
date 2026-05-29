import { createLogger } from "./logger.js";

const SETTINGS_KEY = "dmb_settings_v1";
const log = createLogger("state");

function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  const parsed = raw ? safeJsonParse(raw, null) : null;
  return { theme: parsed?.theme ?? "cream" };
}

function saveSettings(next) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

const settings = (() => {
  let current = loadSettings();
  return {
    getTheme() {
      return current.theme;
    },
    setTheme(theme) {
      current = { ...current, theme };
      saveSettings(current);
      log.info("theme:set", { theme });
    },
  };
})();

export const appState = { settings };
