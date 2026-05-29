import { api } from "../api.js";
import { createLogger } from "../logger.js";
import { requireUser } from "../authGuard.js";
import { router } from "../router.js";

const log = createLogger("view:profile");

export async function renderProfileView() {
  const user = await requireUser();
  if (!user) return document.createElement("div");

  const wrap = document.createElement("div");
  wrap.className = "stack";

  const h = document.createElement("h1");
  h.className = "headline-md";
  h.textContent = `個人頁 · ${user.username}`;

  const form = document.createElement("form");
  form.className = "stack auth-card";

  const introLabel = document.createElement("div");
  introLabel.className = "label-caps";
  introLabel.textContent = "自我介紹";

  const intro = document.createElement("textarea");
  intro.className = "input";
  intro.rows = 4;
  intro.value = user.profileIntro || "";
  intro.placeholder = "用幾句話介紹你自己…";

  const save = document.createElement("button");
  save.type = "submit";
  save.className = "ui-btn ui-btn--primary";
  save.textContent = "儲存自我介紹";

  const out = document.createElement("div");
  form.append(introLabel, intro, save);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    out.replaceChildren();
    try {
      await api.profile.updateIntro({ userId: user.id, profileIntro: intro.value });
      const ok = document.createElement("div");
      ok.className = "notice notice--success";
      ok.textContent = "已儲存。";
      out.append(ok);
      log.info("profile:saved");
    } catch {
      const err = document.createElement("div");
      err.className = "notice notice--error";
      err.textContent = "儲存失敗。";
      out.append(err);
    }
  });

  const links = document.createElement("div");
  links.style.display = "flex";
  links.style.flexWrap = "wrap";
  links.style.gap = "12px";

  const btnMsg = document.createElement("button");
  btnMsg.type = "button";
  btnMsg.className = "ui-btn";
  btnMsg.textContent = "畢業留言";
  btnMsg.addEventListener("click", () => router.navigate("/messages"));

  const btnFeed = document.createElement("button");
  btnFeed.type = "button";
  btnFeed.className = "ui-btn";
  btnFeed.textContent = "時間軸";
  btnFeed.addEventListener("click", () => router.navigate("/feed"));

  const btnLogout = document.createElement("button");
  btnLogout.type = "button";
  btnLogout.className = "ui-btn ui-btn--ghost";
  btnLogout.textContent = "登出";
  btnLogout.addEventListener("click", async () => {
    await api.auth.logout();
    router.navigate("/");
  });

  const danger = document.createElement("details");
  danger.className = "auth-card";
  const sum = document.createElement("summary");
  sum.textContent = "進階：本機資料";
  const exportBtn = document.createElement("button");
  exportBtn.type = "button";
  exportBtn.className = "ui-btn";
  exportBtn.textContent = "匯出 JSON 備份";
  exportBtn.addEventListener("click", async () => {
    const data = await api.exportLocalData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dmb-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    log.info("profile:export");
  });

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "ui-btn ui-btn--ghost";
  clearBtn.textContent = "清除本機所有資料";
  clearBtn.addEventListener("click", async () => {
    if (!confirm("確定要刪除本機所有使用者、記憶與留言？此操作無法復原。")) return;
    await api.clearAllLocalData();
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    router.navigate("/");
    log.warn("profile:cleared");
  });

  danger.append(sum, exportBtn, clearBtn);
  links.append(btnMsg, btnFeed, btnLogout);

  wrap.append(h, form, out, links, danger);
  return wrap;
}
