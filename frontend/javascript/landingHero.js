import { createLogger } from "./logger.js";

const log = createLogger("landingHero");

const STORAGE_KEY = "graduation:hero-copy-position";
const DEFAULT_LEFT = 20;
const DEFAULT_TOP = 50;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampPosition(bounds, copy, x, y) {
  const maxX = Math.max(0, bounds.clientWidth - copy.offsetWidth);
  const maxY = Math.max(0, bounds.clientHeight - copy.offsetHeight);
  return {
    x: clamp(x, 0, maxX),
    y: clamp(y, 0, maxY),
  };
}

function loadPosition() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.unit !== "px") return null;
    if (typeof data.x !== "number" || typeof data.y !== "number") return null;
    if (!Number.isFinite(data.x) || !Number.isFinite(data.y)) return null;
    return { x: data.x, y: data.y };
  } catch {
    return null;
  }
}

function savePosition(x, y) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ unit: "px", x, y }));
  } catch (err) {
    log.warn("savePositionFailed", { err: String(err) });
  }
}

function clearPosition() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function applyPosition(copy, x, y) {
  copy.style.setProperty("--hero-copy-x", `${x}px`);
  copy.style.setProperty("--hero-copy-y", `${y}px`);
}

/**
 * @param {{ copy: HTMLElement; bounds: HTMLElement }} opts
 */
export function initHeroCopyDrag({ copy, bounds }) {
  copy.setAttribute("aria-label", "旅程標題，可拖曳移動");
  copy.title = "拖曳移開 · 雙擊還原預設位置";

  const saved = loadPosition();
  let currentX = saved?.x ?? DEFAULT_LEFT;
  let currentY = saved?.y ?? DEFAULT_TOP;

  function setPosition(x, y) {
    const next = clampPosition(bounds, copy, x, y);
    currentX = next.x;
    currentY = next.y;
    applyPosition(copy, currentX, currentY);
  }

  setPosition(currentX, currentY);

  let dragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function resetPosition() {
    clearPosition();
    setPosition(DEFAULT_LEFT, DEFAULT_TOP);
    log.debug("heroCopyReset");
  }

  copy.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    const copyRect = copy.getBoundingClientRect();
    dragOffsetX = e.clientX - copyRect.left;
    dragOffsetY = e.clientY - copyRect.top;
    copy.classList.add("landing-hero__copy--dragging");
    copy.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  copy.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const boundsRect = bounds.getBoundingClientRect();
    const x = e.clientX - boundsRect.left - dragOffsetX;
    const y = e.clientY - boundsRect.top - dragOffsetY;
    setPosition(x, y);
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    copy.classList.remove("landing-hero__copy--dragging");
    if (copy.hasPointerCapture(e.pointerId)) {
      copy.releasePointerCapture(e.pointerId);
    }
    savePosition(currentX, currentY);
  }

  copy.addEventListener("pointerup", endDrag);
  copy.addEventListener("pointercancel", endDrag);

  copy.addEventListener("dblclick", () => {
    resetPosition();
  });
}
