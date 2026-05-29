import { api } from "../api.js";
import { createLogger } from "../logger.js";
import { router } from "../router.js";

const log = createLogger("view:auth");

function field(labelText, { type = "text", name, placeholder }) {
  const wrap = document.createElement("label");
  wrap.className = "field";
  const label = document.createElement("div");
  label.className = "label-caps";
  label.textContent = labelText;
  const input = document.createElement("input");
  input.className = "input";
  input.type = type;
  input.name = name;
  input.autocomplete = name;
  input.placeholder = placeholder || "";
  wrap.append(label, input);
  return { wrap, input };
}

function msg(text, kind = "info") {
  const div = document.createElement("div");
  div.className = `notice notice--${kind}`;
  div.textContent = text;
  return div;
}

export async function renderAuthView() {
  const wrap = document.createElement("div");
  wrap.className = "stack";

  const h = document.createElement("h1");
  h.className = "headline-md";
  h.textContent = "登入 / 註冊（本機版）";

  const p = document.createElement("p");
  p.className = "muted";
  p.textContent =
    "目前不連後端，帳號只用於本機識別；真正安全驗證會在之後串接 Firebase Auth 後完成。";

  const card = document.createElement("div");
  card.className = "auth-card stack";

  const current = await api.auth.getCurrentUser();
  if (current) {
    const already = msg(`你已登入：${current.username}`, "success");
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.flexWrap = "wrap";
    row.style.gap = "12px";
    const btnProfile = document.createElement("button");
    btnProfile.className = "ui-btn ui-btn--primary";
    btnProfile.type = "button";
    btnProfile.textContent = "個人頁";
    btnProfile.addEventListener("click", () => router.navigate("/profile"));
    const btnFeed = document.createElement("button");
    btnFeed.className = "ui-btn";
    btnFeed.type = "button";
    btnFeed.textContent = "時間軸";
    btnFeed.addEventListener("click", () => router.navigate("/feed"));
    row.append(btnProfile, btnFeed);
    card.append(already, row);
    wrap.append(h, p, card);
    return wrap;
  }

  const tabs = document.createElement("div");
  tabs.className = "auth-tabs";
  const btnLogin = document.createElement("button");
  btnLogin.type = "button";
  btnLogin.className = "ui-btn ui-btn--ghost";
  btnLogin.textContent = "登入";
  const btnReg = document.createElement("button");
  btnReg.type = "button";
  btnReg.className = "ui-btn ui-btn--ghost";
  btnReg.textContent = "註冊";
  tabs.append(btnLogin, btnReg);

  const pane = document.createElement("div");
  pane.className = "stack";
  let mode = "login";

  const renderPane = () => {
    pane.replaceChildren();
    btnLogin.disabled = mode === "login";
    btnReg.disabled = mode === "register";

    const form = document.createElement("form");
    form.className = "stack";
    const u = field("使用者名稱", { name: "username", placeholder: "例如：Neil" });
    const pw = field("密碼", { type: "password", name: "password", placeholder: "至少 6 字元（本機版）" });
    const note = msg(
      "本機版不連後端：密碼以不可逆摘要存於你的電腦；之後串 Firebase Auth 才會變成真正安全的登入。",
      "warn"
    );
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "12px";
    actions.style.flexWrap = "wrap";
    const submit = document.createElement("button");
    submit.className = "ui-btn ui-btn--primary";
    submit.type = "submit";
    submit.textContent = mode === "login" ? "登入" : "建立帳號";
    const back = document.createElement("button");
    back.className = "ui-btn";
    back.type = "button";
    back.textContent = "回到首頁";
    back.addEventListener("click", () => router.navigate("/"));
    actions.append(submit, back);
    form.append(u.wrap, pw.wrap, note, actions);

    const out = document.createElement("div");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      out.replaceChildren();
      submit.disabled = true;
      try {
        if (mode === "login") {
          await api.auth.login({ username: u.input.value, password: pw.input.value });
        } else {
          await api.auth.register({ username: u.input.value, password: pw.input.value });
        }
        log.info("auth:ok", { mode });
        router.navigate("/profile");
      } catch (err) {
        const code = err instanceof Error ? err.message : "unknown_error";
        log.warn("auth:fail", { mode, code });
        const map = {
          username_required: "請輸入使用者名稱。",
          password_too_short: "密碼至少 6 字元。",
          username_taken: "這個使用者名稱已被使用。",
          invalid_credentials: "帳號或密碼錯誤。",
        };
        out.append(msg(map[code] || `發生錯誤：${code}`, "error"));
      } finally {
        submit.disabled = false;
      }
    });
    pane.append(form, out);
  };

  btnLogin.addEventListener("click", () => {
    mode = "login";
    renderPane();
  });
  btnReg.addEventListener("click", () => {
    mode = "register";
    renderPane();
  });

  renderPane();
  card.append(tabs, pane);
  wrap.append(h, p, card);
  return wrap;
}
