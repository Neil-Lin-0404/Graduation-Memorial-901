import { appState } from "./state.js";
import { createLogger } from "./logger.js";

const log = createLogger("themePicker");

export const THEMES = [
  { id: "cream", label: "奶油紙感" },
  { id: "sky", label: "天空藍" },
  { id: "blue", label: "學院深藍" },
  { id: "slate", label: "深夜灰" },
];

function getColorScheme(theme) {
  return theme === "blue" || theme === "slate" ? "dark" : "light";
}

export function applyTheme(theme) {
  const next = THEMES.some((t) => t.id === theme) ? theme : "cream";
  document.documentElement.dataset.theme = next;
  appState.settings.setTheme(next);
  syncThemePickerUi(next);
  log.info("theme:apply", { theme: next, colorScheme: getColorScheme(next) });
}

export function syncThemePickerUi(theme) {
  const active = THEMES.some((t) => t.id === theme) ? theme : "cream";
  document.querySelectorAll("[data-theme-option]").forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    const id = btn.getAttribute("data-theme-option");
    btn.setAttribute("aria-selected", id === active ? "true" : "false");
  });
}

function setMoonOpen(toggle, open) {
  toggle.classList.toggle("is-moon-open", open);
}

function closeList(picker) {
  const list = picker.querySelector(".theme-picker__list");
  const toggle = picker.querySelector(".theme-picker__toggle");
  if (!(list instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) return;
  list.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  setMoonOpen(toggle, false);
}

function openList(picker) {
  const list = picker.querySelector(".theme-picker__list");
  const toggle = picker.querySelector(".theme-picker__toggle");
  if (!(list instanceof HTMLElement) || !(toggle instanceof HTMLButtonElement)) return;

  setMoonOpen(toggle, true);
  toggle.setAttribute("aria-expanded", "true");

  list.classList.remove("is-open");
  void list.offsetWidth;
  list.classList.add("is-open");
}

export function initThemePicker() {
  const picker = document.getElementById("theme-picker");
  if (!picker) return;

  const toggle = picker.querySelector(".theme-picker__toggle");
  const list = picker.querySelector(".theme-picker__list");
  if (!(toggle instanceof HTMLButtonElement) || !(list instanceof HTMLElement)) return;

  syncThemePickerUi(appState.settings.getTheme());

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = list.classList.contains("is-open");
    if (isOpen) closeList(picker);
    else openList(picker);
    log.debug("toggle", { open: !isOpen });
  });

  list.addEventListener("click", (e) => {
    const btn = e.target instanceof Element ? e.target.closest("[data-theme-option]") : null;
    if (!(btn instanceof HTMLButtonElement)) return;
    const theme = btn.getAttribute("data-theme-option");
    if (!theme || !THEMES.some((t) => t.id === theme)) return;
    applyTheme(theme);
    closeList(picker);
  });

  document.addEventListener("click", (e) => {
    if (!picker.contains(e.target instanceof Node ? e.target : null)) {
      closeList(picker);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeList(picker);
  });
}
