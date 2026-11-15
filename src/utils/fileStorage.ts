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
 * Infers MIME type from binary magic bytes and optional filename when a data URL
 * was saved with an empty or generic application/octet-stream header.
 */
export function inferMimeType(bytes: Uint8Array, declaredMime: string, fileName?: string): string {
  if (bytes.length >= 4) {
    // %PDF
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      return 'application/pdf';
    }
    // PNG
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return 'image/png';
    }
    // JPEG
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return 'image/jpeg';
    }
    // GIF
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return 'image/gif';
    }
  }

  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.csv')) return 'text/plain';

  if (declaredMime && declaredMime !== 'application/octet-stream') {
    return declaredMime;
  }
  return declaredMime || 'application/octet-stream';
}

/**
 * Decodes a base64 data: URL into a Uint8Array and resolved MIME type.
 */
export function dataUrlToUint8Array(
  dataUrl: string,
  fileName?: string
): { bytes: Uint8Array; mimeType: string } | null {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const header = dataUrl.slice(0, commaIdx);
    const payload = dataUrl.slice(commaIdx + 1);
    const mimeMatch = header.match(/data:([^;]+);?/i);
    const declaredMime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const isBase64 = /;base64/i.test(header);

    let bytes: Uint8Array;
    if (isBase64) {
      const binary = atob(payload);
      const len = binary.length;
      bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
    } else {
      bytes = new TextEncoder().encode(decodeURIComponent(payload));
    }

    const mimeType = inferMimeType(bytes, declaredMime, fileName);
    return { bytes, mimeType };
  } catch {
    return null;
  }
}

/**
 * Converts a base64 data: URL into a real Blob Object URL so large PDFs/files
 * preview and download reliably without browser data-URL length limits.
 */
export function dataUrlToBlobUrl(dataUrl: string, fileName?: string): { url: string; revoke: boolean; mimeType?: string } {
  if (!dataUrl || !dataUrl.startsWith('data:')) {
    return { url: dataUrl, revoke: false };
  }
  const decoded = dataUrlToUint8Array(dataUrl, fileName);
  if (!decoded) {
    return { url: dataUrl, revoke: false };
  }
  try {
    const buffer = decoded.bytes.buffer.slice(
      decoded.bytes.byteOffset,
      decoded.bytes.byteOffset + decoded.bytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([buffer], { type: decoded.mimeType });
    return { url: URL.createObjectURL(blob), revoke: true, mimeType: decoded.mimeType };
  } catch {
    return { url: dataUrl, revoke: false, mimeType: decoded.mimeType };
  }
}

export function triggerFileDownload(fileUrl: string, fileName: string): void {
  const { url, revoke } = dataUrlToBlobUrl(fileUrl, fileName);
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
