import { config } from "../config.js";
import { createObjectUrl } from "../utils.js";

export function createUploader({ onChange, existing = [] }) {
  const wrap = document.createElement("div");
  wrap.className = "uploader stack";

  const hint = document.createElement("p");
  hint.className = "muted";
  hint.textContent = `最多 ${config.memories.maxPhotos} 張，JPEG/PNG/WebP，單檔 ≤ 5MB。`;

  const input = document.createElement("input");
  input.type = "file";
  input.className = "uploader__input";
  input.multiple = true;
  input.accept = config.memories.allowedPhotoMimes.join(",");
  input.hidden = true;

  const pickBtn = document.createElement("button");
  pickBtn.type = "button";
  pickBtn.className = "ui-btn";
  pickBtn.textContent = "選擇照片";

  const preview = document.createElement("div");
  preview.className = "uploader__preview";

  const selected = [];
  const keepIds = new Set(existing.map((p) => p.id));

  function renderPreview() {
    preview.replaceChildren();
    for (const p of existing) {
      if (!keepIds.has(p.id)) continue;
      const item = document.createElement("div");
      item.className = "uploader__thumb";
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.src = createObjectUrl(p.blob);
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "ui-btn ui-btn--ghost uploader__rm";
      rm.textContent = "移除";
      rm.addEventListener("click", () => {
        keepIds.delete(p.id);
        emit();
        renderPreview();
      });
      item.append(img, rm);
      preview.append(item);
    }
    for (const file of selected) {
      const item = document.createElement("div");
      item.className = "uploader__thumb";
      const img = document.createElement("img");
      img.alt = "";
      img.src = createObjectUrl(file);
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "ui-btn ui-btn--ghost uploader__rm";
      rm.textContent = "移除";
      rm.addEventListener("click", () => {
        const i = selected.indexOf(file);
        if (i >= 0) selected.splice(i, 1);
        emit();
        renderPreview();
      });
      item.append(img, rm);
      preview.append(item);
    }
  }

  function emit() {
    onChange?.({ files: [...selected], keepPhotoIds: [...keepIds] });
  }

  pickBtn.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    const files = [...(input.files || [])];
    input.value = "";
    for (const f of files) {
      if (selected.length + keepIds.size >= config.memories.maxPhotos) break;
      selected.push(f);
    }
    emit();
    renderPreview();
  });

  wrap.append(hint, pickBtn, input, preview);
  renderPreview();

  return {
    el: wrap,
    getPayload() {
      return { files: [...selected], keepPhotoIds: [...keepIds] };
    },
  };
}
