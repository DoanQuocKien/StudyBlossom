// ============================================================
// StudyBlossom 🌸 — IndexedDB Utility (for large binary files)
// Used by: Raw Test sessions (test papers + answer images)
// ============================================================

const IDB = (() => {
  const DB_NAME     = 'StudyBlossomFiles';
  const OLD_DB_NAME = 'StudyBloomFiles';
  const DB_VERSION  = 1;
  const STORE       = 'files';

  let _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      // Check and migrate records from old database
      const checkAndMigrate = () => {
        return new Promise(res => {
          let wasExisting = true;
          const oldReq = indexedDB.open(OLD_DB_NAME);
          oldReq.onupgradeneeded = () => {
            wasExisting = false; // DB didn't exist before, no need to migrate
          };
          oldReq.onsuccess = e => {
            const oldDb = e.target.result;
            if (wasExisting && oldDb.objectStoreNames.contains(STORE)) {
              try {
                const tx = oldDb.transaction(STORE, 'readonly');
                const store = tx.objectStore(STORE);
                const getReq = store.getAll();
                getReq.onsuccess = ev => {
                  const records = ev.target.result;
                  oldDb.close();
                  res(records || []);
                };
                getReq.onerror = () => { oldDb.close(); res([]); };
              } catch {
                oldDb.close();
                res([]);
              }
            } else {
              oldDb.close();
              if (!wasExisting) {
                // Clean up the dummy database created by the open check
                indexedDB.deleteDatabase(OLD_DB_NAME);
              }
              res([]);
            }
          };
          oldReq.onerror = () => res([]);
        });
      };

      const doOpenNew = (recordsToMigrate = []) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: 'id' });
          }
        };
        req.onsuccess = e => {
          _db = e.target.result;
          if (recordsToMigrate.length > 0) {
            const tx = _db.transaction(STORE, 'readwrite');
            const store = tx.objectStore(STORE);
            recordsToMigrate.forEach(r => store.put(r));
            tx.oncomplete = () => {
              indexedDB.deleteDatabase(OLD_DB_NAME);
              resolve(_db);
            };
            tx.onerror = () => resolve(_db);
          } else {
            resolve(_db);
          }
        };
        req.onerror = e => reject(e.target.error);
      };

      checkAndMigrate().then(records => {
        doOpenNew(records);
      }).catch(() => {
        doOpenNew();
      });
    });
  }

  return {
    /**
     * Save a binary blob/file.
     * @param {string} id    - Unique key (e.g. testId + '_paper')
     * @param {Blob|ArrayBuffer|string} data - The file data
     * @param {string} mimeType
     */
    async put(id, data, mimeType = 'application/octet-stream') {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ id, data, mimeType, savedAt: Date.now() });
        tx.oncomplete = resolve;
        tx.onerror    = e => reject(e.target.error);
      });
    },

    /**
     * Retrieve a stored file by id.
     * @returns {Promise<{id, data, mimeType, savedAt}|null>}
     */
    async get(id) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx  = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(id);
        req.onsuccess = e => resolve(e.target.result || null);
        req.onerror   = e => reject(e.target.error);
      });
    },

    /**
     * Delete a stored file.
     */
    async delete(id) {
      const db = await open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = resolve;
        tx.onerror    = e => reject(e.target.error);
      });
    },

    /**
     * Store a File object, return the object URL for display.
     */
    async storeFile(id, file) {
      const buffer = await file.arrayBuffer();
      await this.put(id, buffer, file.type);
    },

    /**
     * Get a displayable URL for a stored file.
     * Returns null if not found.
     */
    async getObjectURL(id) {
      const record = await this.get(id);
      if (!record) return null;
      const blob = new Blob([record.data], { type: record.mimeType });
      return URL.createObjectURL(blob);
    },
  };
})();
