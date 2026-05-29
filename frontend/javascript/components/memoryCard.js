import { createPolaroid } from "./polaroid.js";
import { createChip } from "./chips.js";
import { createObjectUrl, formatDate } from "../utils.js";

export function createMemoryCard(memory, { onOpen }) {
  const article = document.createElement("article");
  article.className = "memory-card lift-on-hover";

  const top = document.createElement("div");
  top.className = "memory-card__top";

  const meta = document.createElement("div");
  meta.className = "label-caps";
  meta.textContent = [formatDate(memory.date), memory.location].filter(Boolean).join(" · ");

  const title = document.createElement("h2");
  title.className = "headline-sm";
  title.textContent = memory.title || "";

  top.append(meta, title);

  const body = document.createElement("p");
  body.className = "memory-card__excerpt muted";
  const excerpt = (memory.body || "").slice(0, 160);
  body.textContent = excerpt.length < (memory.body || "").length ? `${excerpt}…` : excerpt;

  let polaroid = null;
  const photo = memory.photos?.[0];
  if (photo?.blob) {
    polaroid = createPolaroid({
      src: createObjectUrl(photo.blob),
      alt: memory.title,
      caption: "",
    });
    polaroid.classList.add("memory-card__polaroid");
  }

  const tags = document.createElement("div");
  tags.className = "memory-card__tags";
  for (const t of memory.tags || []) tags.append(createChip(t));

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ui-btn ui-btn--ghost memory-card__open";
  btn.textContent = "閱讀全文";
  btn.addEventListener("click", () => onOpen?.(memory.id));

  article.append(top);
  if (polaroid) article.append(polaroid);
  if (memory.body) article.append(body);
  if ((memory.tags || []).length) article.append(tags);
  article.append(btn);

  return article;
}
