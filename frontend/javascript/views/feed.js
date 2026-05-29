import { api } from "../api.js";
import { createLogger } from "../logger.js";
import { createMemoryCard } from "../components/memoryCard.js";
import { router } from "../router.js";
import { revokeAllObjectUrls } from "../utils.js";

const log = createLogger("view:feed");

export async function renderFeedView() {
  revokeAllObjectUrls();
  const wrap = document.createElement("div");
  wrap.className = "stack";

  const h = document.createElement("h1");
  h.className = "headline-md";
  h.textContent = "時間軸";

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.flexWrap = "wrap";
  actions.style.gap = "12px";

  const me = await api.auth.getCurrentUser();
  const btnNew = document.createElement("button");
  btnNew.className = "ui-btn ui-btn--primary";
  btnNew.type = "button";
  btnNew.textContent = "新增記憶";
  if (me) btnNew.addEventListener("click", () => router.navigate("/memory/new"));
  else btnNew.disabled = true;

  const btnAuth = document.createElement("button");
  btnAuth.className = "ui-btn";
  btnAuth.type = "button";
  btnAuth.textContent = me ? "個人頁" : "登入後可新增";
  btnAuth.addEventListener("click", () => router.navigate(me ? "/profile" : "/auth"));

  actions.append(btnNew, btnAuth);

  const grid = document.createElement("div");
  grid.className = "feed-grid";
  const memories = await api.memories.list();
  log.info("feed:load", { count: memories.length });

  if (!memories.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = me
      ? "還沒有記憶。點「新增記憶」開始整理你的畢業檔案。"
      : "尚無記憶。登入後可新增屬於你的片段。";
    wrap.append(h, actions, empty);
    return wrap;
  }

  for (const m of memories) {
    grid.append(createMemoryCard(m, { onOpen: (id) => router.navigate(`/memory/${id}`) }));
  }

  wrap.append(h, actions, grid);
  return wrap;
}
