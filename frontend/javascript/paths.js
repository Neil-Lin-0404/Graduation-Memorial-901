import { config } from "./config.js";

/**
 * GitHub Pages project site base, e.g. "/Graduation-Memorial-901".
 * Empty string on localhost or custom domain at web root.
 */
export function getAppBasePath() {
  if (typeof location === "undefined") return "";
  const repo = config.githubPagesRepo;
  if (!repo || !location.hostname.endsWith(".github.io")) return "";

  const prefix = `/${repo}`;
  const { pathname } = location;
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    return prefix;
  }
  return "";
}

/** Trailing slash: "/" or "/Graduation-Memorial-901/" */
export function getAppBase() {
  const root = getAppBasePath();
  return root ? `${root}/` : "/";
}

export function getStaticBase() {
  return `${getAppBase()}frontend/`;
}

export function getServiceWorkerUrl() {
  return `${getAppBase()}service-worker.js`;
}

/** SPA route like "/feed" -> full pathname for history API */
export function toAppUrl(routePath) {
  const path = routePath.startsWith("/") ? routePath : `/${routePath}`;
  const root = getAppBasePath();
  return root ? `${root}${path}` : path;
}

/** Strip project base so router can match /^\/feed/ etc. */
export function stripAppBase(pathname) {
  const root = getAppBasePath();
  if (!root) return pathname;
  if (pathname === root || pathname === `${root}/`) return "/";
  if (pathname.startsWith(`${root}/`)) {
    return pathname.slice(root.length) || "/";
  }
  return pathname;
}
