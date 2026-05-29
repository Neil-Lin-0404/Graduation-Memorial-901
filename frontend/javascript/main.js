import { router } from "./router.js";
import { appState } from "./state.js";
import { bindShellEvents } from "./shell.js";
import { syncThemePickerUi, initThemePicker } from "./themePicker.js";
import { createLogger } from "./logger.js";

const log = createLogger("main");

function initTheme() {
  const theme = appState.settings.getTheme();
  document.documentElement.dataset.theme = theme;
  syncThemePickerUi(theme);
  log.info("initTheme", { theme });
}

initTheme();
initThemePicker();
bindShellEvents();
router.start();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then(() => log.info("serviceWorker:registered"))
    .catch((err) => log.warn("serviceWorker:failed", { err: String(err) }));
}
