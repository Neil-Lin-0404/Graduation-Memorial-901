export function uid(prefix = "id") {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function clampText(text, maxLen) {
  const s = typeof text === "string" ? text : "";
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen);
}

export function normalizeLineBreaks(text) {
  return (text || "").replace(/\r\n?/g, "\n");
}

export function stripControlChars(text) {
  return (text || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("zh-Hant", { year: "numeric", month: "short", day: "numeric" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

function hasJpegMagic(bytes) {
  return bytes[0] === 0xff && bytes[1] === 0xd8;
}

function hasPngMagic(bytes) {
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

function hasWebpMagic(bytes) {
  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

export async function fileToPhotoRecord(file, { maxBytes, allowedMimes }) {
  if (!(file instanceof File)) throw new Error("invalid_file");
  if (!allowedMimes.includes(file.type)) throw new Error("invalid_image_type");
  if (file.size > maxBytes) throw new Error("image_too_large");

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ok =
    (file.type === "image/jpeg" && hasJpegMagic(head)) ||
    (file.type === "image/png" && hasPngMagic(head)) ||
    (file.type === "image/webp" && hasWebpMagic(head));
  if (!ok) throw new Error("invalid_image_content");

  return { id: uid("photo"), mimeType: file.type, blob: file };
}

const objectUrls = new Set();

export function createObjectUrl(blob) {
  const url = URL.createObjectURL(blob);
  objectUrls.add(url);
  return url;
}

export function revokeObjectUrl(url) {
  if (objectUrls.has(url)) {
    URL.revokeObjectURL(url);
    objectUrls.delete(url);
  }
}

export function revokeAllObjectUrls() {
  for (const url of objectUrls) URL.revokeObjectURL(url);
  objectUrls.clear();
}

export function parseTagsInput(text) {
  return (text || "")
    .split(/[,，、\s]+/)
    .map((t) => clampText(stripControlChars(t.trim()), 32))
    .filter(Boolean)
    .slice(0, 12);
}
