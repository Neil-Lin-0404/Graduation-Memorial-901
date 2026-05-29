import { renderLandingView } from "./views/landing.js";
import { renderAuthView } from "./views/auth.js";
import { renderFeedView } from "./views/feed.js";
import { renderMemoryDetailView } from "./views/memoryDetail.js";
import { renderMemoryEditorView } from "./views/memoryEditor.js";
import { renderProfileView } from "./views/profile.js";
import { renderMessagesView } from "./views/messages.js";
import { createLogger } from "./logger.js";
import { revokeAllObjectUrls } from "./utils.js";
import { enhanceLazyImages } from "./animation.js";

const log = createLogger("router");

const routes = [
  { path: /^\/$/, render: () => renderLandingView() },
  { path: /^\/auth\/?$/, render: () => renderAuthView() },
  { path: /^\/feed\/?$/, render: () => renderFeedView() },
  { path: /^\/memory\/new\/?$/, render: () => renderMemoryEditorView(null) },
  { path: /^\/memory\/([^/]+)\/edit\/?$/, render: ({ params }) => renderMemoryEditorView(params[0]) },
  { path: /^\/memory\/([^/]+)\/?$/, render: ({ params }) => renderMemoryDetailView(params[0]) },
  { path: /^\/profile\/?$/, render: () => renderProfileView() },
  { path: /^\/messages\/?$/, render: () => renderMessagesView() },
];

function matchRoute(pathname) {
  for (const r of routes) {
    const m = pathname.match(r.path);
    if (m) return { route: r, params: m.slice(1) };
  }
  return null;
}

function getPathname() {
  let pathname = window.location.pathname || "/";
  if (pathname === "/index.htm" || pathname === "/index.html") pathname = "/";
  return pathname;
}

function setAppContent(node, { fullBleed = false } = {}) {
  const root = document.getElementById("app");
  if (!root) return;
  if (fullBleed) {
    root.replaceChildren(node);
    return;
  }
  const shell = document.createElement("div");
  shell.className = "container";
  shell.append(node);
  root.replaceChildren(shell);
}

async function renderCurrent() {
  const pathname = getPathname();
  log.debug("renderCurrent", { pathname });
  const matched = matchRoute(pathname);
  if (!matched) {
    revokeAllObjectUrls();
    const wrap = document.createElement("div");
    wrap.className = "stack";
    const h = document.createElement("h1");
    h.className = "headline-md";
    h.textContent = "找不到頁面";
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = `路徑：${pathname}`;
    wrap.append(h, p);
    setAppContent(wrap);
    return;
  }
  const node = await matched.route.render({ pathname, params: matched.params });
  setAppContent(node, { fullBleed: pathname === "/" });
  enhanceLazyImages(node);
}

function navigate(to) {
  if (typeof to !== "string") return;
  const normalized = to.startsWith("/") ? to : `/${to}`;
  if (normalized === getPathname()) return;
  log.info("navigate", { to: normalized });
  history.pushState({}, "", normalized);
  void renderCurrent();
}

function normalizeEntryUrl() {
  const raw = window.location.pathname || "/";
  if (raw === "/index.htm" || raw === "/index.html") {
    history.replaceState({}, "", "/");
    log.info("normalizeEntryUrl", { from: raw, to: "/" });
  }
}

function start() {
  normalizeEntryUrl();
  window.addEventListener("popstate", () => void renderCurrent());
  log.info("start", { pathname: getPathname() });
  void renderCurrent();
}

export const router = { start, navigate };
