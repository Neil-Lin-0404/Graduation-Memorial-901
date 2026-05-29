import { db } from "./db.js";
import {
  uid,
  sha256Hex,
  clampText,
  normalizeLineBreaks,
  stripControlChars,
  fileToPhotoRecord,
  parseTagsInput,
} from "./utils.js";
import { createLogger } from "./logger.js";
import { config } from "./config.js";

const log = createLogger("api");
const SESSION_KEY = "dmb_session_v1";

function nowIso() {
  return new Date().toISOString();
}

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(next) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

async function filesToPhotos(files) {
  const list = [...files];
  if (list.length > config.memories.maxPhotos) throw new Error("too_many_photos");
  const photos = [];
  for (const file of list) {
    photos.push(
      await fileToPhotoRecord(file, {
        maxBytes: config.memories.maxPhotoBytes,
        allowedMimes: config.memories.allowedPhotoMimes,
      })
    );
  }
  return photos;
}

export const api = {
  session: {
    get() {
      return getSession();
    },
    clear() {
      log.info("session:clear");
      clearSession();
    },
  },

  auth: {
    async register({ username, password }) {
      const cleanUsername = clampText(stripControlChars(username).trim(), config.auth.maxUsernameLength);
      if (!cleanUsername) throw new Error("username_required");
      if (typeof password !== "string" || password.length < config.auth.minPasswordLength) {
        throw new Error("password_too_short");
      }
      const existing = await db.getByIndex("users", "by_username", cleanUsername);
      if (existing) throw new Error("username_taken");
      const user = {
        id: uid("user"),
        username: cleanUsername,
        passwordHash: await sha256Hex(password),
        profileIntro: "",
        createdAt: nowIso(),
      };
      await db.put("users", user);
      setSession({ userId: user.id, username: user.username, loggedInAt: nowIso() });
      log.info("auth:register", { userId: user.id, username: user.username });
      return user;
    },

    async login({ username, password }) {
      const cleanUsername = clampText(stripControlChars(username).trim(), config.auth.maxUsernameLength);
      const user = await db.getByIndex("users", "by_username", cleanUsername);
      if (!user) throw new Error("invalid_credentials");
      const hash = await sha256Hex(password || "");
      if (hash !== user.passwordHash) throw new Error("invalid_credentials");
      setSession({ userId: user.id, username: user.username, loggedInAt: nowIso() });
      log.info("auth:login", { userId: user.id, username: user.username });
      return user;
    },

    async getCurrentUser() {
      const s = getSession();
      if (!s?.userId) return null;
      return db.get("users", s.userId);
    },

    async logout() {
      clearSession();
      log.info("auth:logout");
    },
  },

  profile: {
    async updateIntro({ userId, profileIntro }) {
      const user = await db.get("users", userId);
      if (!user) throw new Error("not_found");
      const clean = clampText(
        stripControlChars(normalizeLineBreaks(profileIntro)),
        config.auth.maxProfileIntroLength
      );
      const next = { ...user, profileIntro: clean };
      await db.put("users", next);
      log.info("profile:updateIntro", { userId });
      return next;
    },
  },

  memories: {
    async list() {
      const all = await db.getAll("memories");
      return all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    },
    async get(id) {
      return db.get("memories", id);
    },
    async create({ authorId, title, body, tags, date, location, photoFiles }) {
      const photos = photoFiles?.length ? await filesToPhotos(photoFiles) : [];
      const memory = {
        id: uid("memory"),
        authorId,
        title: clampText(stripControlChars(title), config.memories.maxTitleLength),
        body: clampText(stripControlChars(normalizeLineBreaks(body)), config.memories.maxBodyLength),
        tags: Array.isArray(tags) ? tags.slice(0, config.memories.maxTags) : [],
        date: date || nowIso().slice(0, 10),
        location: location ? clampText(stripControlChars(location), 80) : "",
        photos,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      if (!memory.title) throw new Error("title_required");
      await db.put("memories", memory);
      log.info("memories:create", { id: memory.id, photos: photos.length });
      return memory;
    },
    async update({ id, authorId, title, body, tags, date, location, photoFiles, keepPhotoIds }) {
      const existing = await db.get("memories", id);
      if (!existing) throw new Error("not_found");
      if (existing.authorId !== authorId) throw new Error("forbidden");
      const kept = (existing.photos || []).filter((p) => keepPhotoIds?.includes(p.id));
      const newPhotos = photoFiles?.length ? await filesToPhotos(photoFiles) : [];
      const photos = [...kept, ...newPhotos].slice(0, config.memories.maxPhotos);
      const memory = {
        ...existing,
        title: clampText(stripControlChars(title), config.memories.maxTitleLength),
        body: clampText(stripControlChars(normalizeLineBreaks(body)), config.memories.maxBodyLength),
        tags: Array.isArray(tags) ? tags.slice(0, config.memories.maxTags) : [],
        date: date || existing.date,
        location: location ? clampText(stripControlChars(location), 80) : "",
        photos,
        updatedAt: nowIso(),
      };
      if (!memory.title) throw new Error("title_required");
      await db.put("memories", memory);
      log.info("memories:update", { id });
      return memory;
    },
    async remove({ id, authorId }) {
      const existing = await db.get("memories", id);
      if (!existing) throw new Error("not_found");
      if (existing.authorId !== authorId) throw new Error("forbidden");
      await db.delete("memories", id);
      log.info("memories:remove", { id });
    },
  },

  messages: {
    async list() {
      const all = await db.getAll("messages");
      return all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    },
    async create({ fromUserId, fromIntro, content }) {
      const user = await db.get("users", fromUserId);
      if (!user) throw new Error("not_found");
      const intro = clampText(stripControlChars(normalizeLineBreaks(fromIntro)), config.messages.maxIntroLength);
      const body = clampText(stripControlChars(normalizeLineBreaks(content)), config.messages.maxContentLength);
      if (!intro) throw new Error("intro_required");
      if (!body) throw new Error("content_required");
      if (!user.profileIntro) {
        user.profileIntro = intro;
        await db.put("users", user);
      }
      const message = {
        id: uid("msg"),
        fromUserId,
        fromUsername: user.username,
        fromIntro: intro,
        content: body,
        createdAt: nowIso(),
      };
      await db.put("messages", message);
      log.info("messages:create", { id: message.id, fromUserId });
      return message;
    },
  },

  async exportLocalData() {
    const users = await db.getAll("users");
    const memories = await db.getAll("memories");
    const messages = await db.getAll("messages");
    return {
      exportedAt: nowIso(),
      users: users.map(({ passwordHash, ...u }) => u),
      memories: memories.map((m) => ({
        ...m,
        photos: (m.photos || []).map(({ id, mimeType }) => ({ id, mimeType })),
      })),
      messages,
    };
  },

  async clearAllLocalData() {
    for (const m of await db.getAll("memories")) await db.delete("memories", m.id);
    for (const msg of await db.getAll("messages")) await db.delete("messages", msg.id);
    for (const u of await db.getAll("users")) await db.delete("users", u.id);
    clearSession();
    log.warn("clearAllLocalData");
  },
};
