import { api } from "../api.js";
import { createLogger } from "../logger.js";
import { requireUser } from "../authGuard.js";
import { createUploader } from "../components/uploader.js";
import { router } from "../router.js";
import { parseTagsInput, revokeAllObjectUrls } from "../utils.js";

const log = createLogger("view:memoryEditor");

function field(labelText, { type = "text", name, placeholder, value = "" }) {
  const wrap = document.createElement("label");
  wrap.className = "field";
  const label = document.createElement("div");
  label.className = "label-caps";
  label.textContent = labelText;
  const input = document.createElement("input");
  input.className = "input";
  input.type = type;
  input.name = name;
  input.value = value;
  input.placeholder = placeholder || "";
  wrap.append(label, input);
  return { wrap, input };
}

function textareaField(labelText, { name, placeholder, value = "" }) {
  const wrap = document.createElement("label");
  wrap.className = "field";
  const label = document.createElement("div");
  label.className = "label-caps";
  label.textContent = labelText;
  const area = document.createElement("textarea");
  area.className = "input";
  area.name = name;
  area.rows = 6;
  area.value = value;
  area.placeholder = placeholder || "";
  wrap.append(label, area);
  return { wrap, input: area };
}

function notice(text, kind = "info") {
  const div = document.createElement("div");
  div.className = `notice notice--${kind}`;
  div.textContent = text;
  return div;
}

export async function renderMemoryEditorView(memoryId) {
  revokeAllObjectUrls();
  const user = await requireUser();
  if (!user) return document.createElement("div");

  const isEdit = Boolean(memoryId);
  let memory = null;
  if (isEdit) {
    memory = await api.memories.get(memoryId);
    if (!memory || memory.authorId !== user.id) {
      const wrap = document.createElement("div");
      wrap.className = "stack";
      const h = document.createElement("h1");
      h.className = "headline-md";
      h.textContent = "無法編輯此記憶";
      wrap.append(h);
      return wrap;
    }
  }

  const wrap = document.createElement("div");
  wrap.className = "stack";

  const h = document.createElement("h1");
  h.className = "headline-md";
  h.textContent = isEdit ? "編輯記憶" : "新增記憶";

  const form = document.createElement("form");
  form.className = "stack auth-card";

  const titleF = field("標題", { name: "title", value: memory?.title || "", placeholder: "給這段回憶一個名字" });
  const bodyF = textareaField("內文", {
    name: "body",
    value: memory?.body || "",
    placeholder: "寫下你想留下的故事…",
  });
  const tagsF = field("標籤", {
    name: "tags",
    value: (memory?.tags || []).join("、"),
    placeholder: "畢業旅行、班導（逗號分隔）",
  });
  const dateF = field("日期", { type: "date", name: "date", value: memory?.date || "" });
  const locF = field("地點（選填）", { name: "location", value: memory?.location || "" });

  const uploader = createUploader({ existing: memory?.photos || [] });

  const out = document.createElement("div");
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "ui-btn ui-btn--primary";
  submit.textContent = isEdit ? "儲存" : "建立";

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "ui-btn";
  cancel.textContent = "取消";
  cancel.addEventListener("click", () => router.navigate(isEdit ? `/memory/${memoryId}` : "/feed"));

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "12px";
  row.style.flexWrap = "wrap";
  row.append(submit, cancel);

  form.append(titleF.wrap, bodyF.wrap, tagsF.wrap, dateF.wrap, locF.wrap, uploader.el, row);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    out.replaceChildren();
    submit.disabled = true;
    try {
      const payload = uploader.getPayload();
      const common = {
        authorId: user.id,
        title: titleF.input.value,
        body: bodyF.input.value,
        tags: parseTagsInput(tagsF.input.value),
        date: dateF.input.value,
        location: locF.input.value,
        photoFiles: payload.files,
        keepPhotoIds: payload.keepPhotoIds,
      };
      const saved = isEdit
        ? await api.memories.update({ id: memoryId, ...common })
        : await api.memories.create(common);
      log.info("memoryEditor:saved", { id: saved.id });
      router.navigate(`/memory/${saved.id}`);
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";
      const map = {
        title_required: "請填寫標題。",
        too_many_photos: "照片超過上限。",
        invalid_image_type: "僅支援 JPEG / PNG / WebP。",
        image_too_large: "單張照片不得超過 5MB。",
        invalid_image_content: "檔案內容不符合圖片格式。",
      };
      out.append(notice(map[code] || `錯誤：${code}`, "error"));
    } finally {
      submit.disabled = false;
    }
  });

  wrap.append(h, form, out);
  return wrap;
}
