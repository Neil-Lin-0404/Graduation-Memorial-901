import { createLogger } from "./logger.js";

const log = createLogger("animation");

export function enhanceLazyImages(root) {
  if (!(root instanceof Element)) return;
  const imgs = root.querySelectorAll('img[loading="lazy"]');
  if (!imgs.length) return;
  if (!("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const img = e.target;
        if (img instanceof HTMLImageElement && img.dataset.src) {
          img.src = img.dataset.src;
          delete img.dataset.src;
        }
        io.unobserve(e.target);
      }
    },
    { rootMargin: "120px" }
  );

  for (const img of imgs) io.observe(img);
  log.debug("enhanceLazyImages", { count: imgs.length });
}
