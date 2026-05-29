export function createModal({ title, contentNode, onClose }) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";

  const dialog = document.createElement("div");
  dialog.className = "modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const header = document.createElement("div");
  header.className = "modal__header";

  const h = document.createElement("div");
  h.className = "modal__title";
  h.textContent = title || "";

  const btn = document.createElement("button");
  btn.className = "ui-btn ui-btn--ghost";
  btn.type = "button";
  btn.textContent = "關閉";

  const body = document.createElement("div");
  body.className = "modal__body";
  if (contentNode) body.append(contentNode);

  header.append(h, btn);
  dialog.append(header, body);
  backdrop.append(dialog);

  const close = () => {
    backdrop.remove();
    onClose?.();
  };

  btn.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  }, { once: true });

  return { backdrop, close };
}
