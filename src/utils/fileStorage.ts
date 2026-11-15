const DB_NAME = 'shikshyalaya_files_db';
const STORE_NAME = 'files';
const DB_VERSION = 1;

export const IDB_MARKER = '__idb__';

function openFilesDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open IndexedDB'));
  });
}

export async function putStoredFile(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await openFilesDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB putStoredFile error:', err);
  }
}

export async function getStoredFile(key: string): Promise<string | null> {
  try {
    const db = await openFilesDb();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB getStoredFile error:', err);
    return null;
  }
}

export async function deleteStoredFile(key: string): Promise<void> {
  try {
    const db = await openFilesDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB deleteStoredFile error:', err);
  }
}

/**
 * Converts a base64 data: URL into a real Blob Object URL so large PDFs/files
 * preview and download reliably without browser data-URL length limits.
 */
export function dataUrlToBlobUrl(dataUrl: string): { url: string; revoke: boolean } {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return { url: dataUrl, revoke: false };
  }
  try {
    const [header, base64Data] = dataUrl.split(',');
    if (!base64Data) return { url: dataUrl, revoke: false };
    const mimeMatch = header.match(/data:([^;]+);?/i);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return { url: URL.createObjectURL(blob), revoke: true };
  } catch {
    return { url: dataUrl, revoke: false };
  }
}

export function triggerFileDownload(fileUrl: string, fileName: string): void {
  const { url, revoke } = dataUrlToBlobUrl(fileUrl);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (revoke) {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
