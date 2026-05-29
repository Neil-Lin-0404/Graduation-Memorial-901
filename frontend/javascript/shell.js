import { router } from "./router.js";
import { applyTheme, syncThemePickerUi } from "./themePicker.js";

export function bindShellEvents() {
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const navBtn = target.closest("[data-nav]");
    if (navBtn instanceof HTMLElement) {
      const to = navBtn.getAttribute("data-nav");
      if (to) router.navigate(to);
    }
  });
}

export { applyTheme, syncThemePickerUi };
