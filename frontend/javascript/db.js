import { createLogger } from "./logger.js";

const log = createLogger("db");

const DB_NAME = "dmb_v1";
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      log.info("upgrade", { from: req.oldVersion, to: DB_VERSION });

      if (!db.objectStoreNames.contains("users")) {
        const s = db.createObjectStore("users", { keyPath: "id" });
        s.createIndex("by_username", "username", { unique: true });
      }
      if (!db.objectStoreNames.contains("memories")) {
        const s = db.createObjectStore("memories", { keyPath: "id" });
        s.createIndex("by_authorId", "authorId", { unique: false });
        s.createIndex("by_createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains("messages")) {
        const s = db.createObjectStore("messages", { keyPath: "id" });
        s.createIndex("by_fromUserId", "fromUserId", { unique: false });
        s.createIndex("by_createdAt", "createdAt", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const out = fn(store, tx);
    tx.oncomplete = () => resolve(out);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const db = {
  async put(storeName, value) {
    log.debug("put", { storeName, id: value?.id });
    return withStore(storeName, "readwrite", (store) => reqToPromise(store.put(value)));
  },
  async get(storeName, key) {
    log.debug("get", { storeName, key });
    return withStore(storeName, "readonly", (store) => reqToPromise(store.get(key)));
  },
  async getByIndex(storeName, indexName, indexKey) {
    log.debug("getByIndex", { storeName, indexName, indexKey });
    return withStore(storeName, "readonly", (store) => reqToPromise(store.index(indexName).get(indexKey)));
  },
  async getAll(storeName) {
    log.debug("getAll", { storeName });
    return withStore(storeName, "readonly", (store) => reqToPromise(store.getAll()));
  },
  async delete(storeName, key) {
    log.debug("delete", { storeName, key });
    return withStore(storeName, "readwrite", (store) => reqToPromise(store.delete(key)));
  },
};
