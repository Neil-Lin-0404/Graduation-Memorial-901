import { api } from "../api.js";
import { createLogger } from "../logger.js";
import { requireUser } from "../authGuard.js";
import { formatDate } from "../utils.js";

const log = createLogger("view:messages");

export async function renderMessagesView() {
  const user = await requireUser();
  if (!user) return document.createElement("div");

  const wrap = document.createElement("div");
  wrap.className = "stack";

  const h = document.createElement("h1");
  h.className = "headline-md";
  h.textContent = "畢業留言牆";

  const intro = document.createElement("p");
  intro.className = "muted";
  intro.textContent = "需登入。請填寫自我介紹與這三年想說的話，留言會保存在本機。";

  const form = document.createElement("form");
  form.className = "stack auth-card";

  const introF = document.createElement("label");
  introF.className = "field";
  const introL = document.createElement("div");
  introL.className = "label-caps";
  introL.textContent = "自我介紹（必填）";
  const introInput = document.createElement("textarea");
  introInput.className = "input";
  introInput.rows = 3;
  introInput.value = user.profileIntro || "";
  introF.append(introL, introInput);

  const contentF = document.createElement("label");
  contentF.className = "field";
  const contentL = document.createElement("div");
  contentL.className = "label-caps";
  contentL.textContent = "這三年想說的話（必填）";
  const contentInput = document.createElement("textarea");
  contentInput.className = "input";
  contentInput.rows = 5;
  contentF.append(contentL, contentInput);

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "ui-btn ui-btn--primary";
  submit.textContent = "送出留言";

  const out = document.createElement("div");
  form.append(introF, contentF, submit);

  const list = document.createElement("div");
  list.className = "stack";

  async function renderList(container, currentUserId) {
    container.replaceChildren();
    const items = await api.messages.list();
    log.debug("messages:list", { count: items.length });
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "還沒有留言，成為第一個吧。";
      container.append(empty);
      return;
    }
    for (const m of items) {
      const card = document.createElement("article");
      card.className = "memory-card";
      const who = document.createElement("div");
      who.className = "label-caps";
      who.textContent = `${m.fromUsername}${m.fromUserId === currentUserId ? "（你）" : ""} · ${formatDate(m.createdAt)}`;
      const introP = document.createElement("p");
      introP.className = "muted";
      introP.textContent = m.fromIntro;
      const body = document.createElement("p");
      body.className = "body-lg";
      body.style.whiteSpace = "pre-wrap";
      body.textContent = m.content;
      card.append(who, introP, body);
      container.append(card);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    out.replaceChildren();
    submit.disabled = true;
    try {
      await api.messages.create({
        fromUserId: user.id,
        fromIntro: introInput.value,
        content: contentInput.value,
      });
      contentInput.value = "";
      const ok = document.createElement("div");
      ok.className = "notice notice--success";
      ok.textContent = "留言已儲存。";
      out.append(ok);
      log.info("messages:posted");
      await renderList(list, user.id);
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";
      const map = { intro_required: "請填寫自我介紹。", content_required: "請填寫這三年想說的話。" };
      const errEl = document.createElement("div");
      errEl.className = "notice notice--error";
      errEl.textContent = map[code] || `錯誤：${code}`;
      out.append(errEl);
    } finally {
      submit.disabled = false;
    }
  });

  await renderList(list, user.id);
  wrap.append(h, intro, form, out, list);
  return wrap;
}
