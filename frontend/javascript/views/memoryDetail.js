import { api } from "../api.js";
import { createLogger } from "../logger.js";
import { createPolaroid } from "../components/polaroid.js";
import { createChip } from "../components/chips.js";
import { router } from "../router.js";
import { createObjectUrl, formatDate, revokeAllObjectUrls } from "../utils.js";

const log = createLogger("view:memoryDetail");

export async function renderMemoryDetailView(memoryId) {
  revokeAllObjectUrls();
  const wrap = document.createElement("div");
  wrap.className = "stack";

  const memory = await api.memories.get(memoryId);
  if (!memory) {
    const h = document.createElement("h1");
    h.className = "headline-md";
    h.textContent = "找不到這則記憶";
    wrap.append(h);
    return wrap;
  }

  log.debug("render", { id: memoryId });

  const meta = document.createElement("div");
  meta.className = "label-caps";
  meta.textContent = [formatDate(memory.date), memory.location].filter(Boolean).join(" · ");

  const h = document.createElement("h1");
  h.className = "headline-md";
  h.textContent = memory.title;

  const body = document.createElement("div");
  body.className = "body-lg";
  body.style.whiteSpace = "pre-wrap";
  body.textContent = memory.body || "";

  const gallery = document.createElement("div");
  gallery.className = "feed-grid";
  for (const p of memory.photos || []) {
    if (!p.blob) continue;
    gallery.append(createPolaroid({ src: createObjectUrl(p.blob), alt: memory.title, caption: "" }));
  }

  const tags = document.createElement("div");
  tags.className = "memory-card__tags";
  for (const t of memory.tags || []) tags.append(createChip(t));

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.flexWrap = "wrap";
  actions.style.gap = "12px";

  const back = document.createElement("button");
  back.className = "ui-btn";
  back.type = "button";
  back.textContent = "返回時間軸";
  back.addEventListener("click", () => router.navigate("/feed"));

  const me = await api.auth.getCurrentUser();
  if (me && me.id === memory.authorId) {
    const edit = document.createElement("button");
    edit.className = "ui-btn ui-btn--primary";
    edit.type = "button";
    edit.textContent = "編輯";
    edit.addEventListener("click", () => router.navigate(`/memory/${memoryId}/edit`));
    actions.append(edit);
  }
  actions.append(back);

  wrap.append(meta, h);
  if ((memory.photos || []).length) wrap.append(gallery);
  if (memory.body) wrap.append(body);
  if ((memory.tags || []).length) wrap.append(tags);
  wrap.append(actions);
  return wrap;
}
