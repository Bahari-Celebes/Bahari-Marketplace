// Offline-first storage: IndexedDB cache + sync queue.
// ponytail: idb wrapper via raw IndexedDB; add 'idb' dependency only when schema complexity grows.

const DB_NAME = 'bahari_offline';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'url' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// --- Cache ---
export async function cacheData(url: string, data: any): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('cache', 'readwrite');
    tx.objectStore('cache').put({ url, data, timestamp: Date.now() });
  } catch { /* offline store not critical */ }
}

export async function getCachedData(url: string): Promise<any | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('cache', 'readonly');
      const req = tx.objectStore('cache').get(url);
      req.onsuccess = () => {
        const entry = req.result;
        if (!entry) { resolve(null); return; }
        // TTL: 24h
        if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
          resolve(null);
          return;
        }
        resolve(entry.data);
      };
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

// --- Sync Queue (write operations queued while offline) ---
export interface SyncQueueItem {
  id?: number;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  recordId?: string;
  data?: any;
  createdAt: number;
}

export async function pushToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt'>): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    tx.objectStore('syncQueue').add({ ...item, createdAt: Date.now() });
  } catch {}
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('syncQueue', 'readonly');
      const req = tx.objectStore('syncQueue').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch { return []; }
}

export async function clearSyncQueue(ids: number[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    for (const id of ids) store.delete(id);
  } catch {}
}

export async function getPendingCount(): Promise<number> {
  const items = await getSyncQueue();
  return items.length;
}

// --- Online/Offline Detection ---
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function watchConnectivity(onChange: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const online = () => onChange(true);
  const offline = () => onChange(false);
  window.addEventListener('online', online);
  window.addEventListener('offline', offline);
  return () => {
    window.removeEventListener('online', online);
    window.removeEventListener('offline', offline);
  };
}
