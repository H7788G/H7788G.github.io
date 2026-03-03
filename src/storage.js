(function(global){
  const DB_NAME = 'liftr_db';
  const STORE = 'app';
  const DB_VERSION = 2;

  let dbPromise = null;
  let writeQueued = Promise.resolve();

  function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function tx(mode, fn){
    return openDB().then(db => new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const s = t.objectStore(STORE);
      const result = fn(s);
      t.oncomplete = () => resolve(result?.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }

  function readDB(){
    return tx('readonly', s => s.get('db'));
  }

  function writeDB(payload){
    return tx('readwrite', s => s.put(payload, 'db'));
  }

  function migrate(data, fallback){
    const safe = data && typeof data === 'object' ? data : JSON.parse(JSON.stringify(fallback));
    if(!safe._meta) safe._meta = { schemaVersion: 1, updatedAt: new Date().toISOString() };

    if(safe._meta.schemaVersion < 2){
      if(!Array.isArray(safe.customExercises)) safe.customExercises = [];
      if(!safe.settings) safe.settings = fallback.settings;
      if(typeof safe.settings.errorTracking !== 'boolean') safe.settings.errorTracking = true;
      safe._meta.schemaVersion = 2;
      safe._meta.updatedAt = new Date().toISOString();
    }
    return safe;
  }

  async function bootstrap(localStorageKey, fallback){
    const fromIndexed = await readDB().catch(() => null);
    if(fromIndexed){
      return migrate(fromIndexed, fallback);
    }

    let local = null;
    try {
      local = JSON.parse(localStorage.getItem(localStorageKey) || 'null');
    } catch(_){}

    const merged = migrate(local || fallback, fallback);
    await writeDB(merged).catch(() => null);
    try { localStorage.setItem(localStorageKey, JSON.stringify(merged)); } catch(_){}
    return merged;
  }

  function persist(localStorageKey, payload){
    const safe = migrate(payload, payload);
    try { localStorage.setItem(localStorageKey, JSON.stringify(safe)); } catch(_) {}
    writeQueued = writeQueued.then(() => writeDB(safe)).catch(() => null);
    return writeQueued;
  }

  global.StorageEngine = {
    bootstrap,
    persist,
    migrate,
    DB_VERSION
  };
})(window);
