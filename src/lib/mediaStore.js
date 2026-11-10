const DB_NAME = 'manikanta-portfolio-media'
const STORE_NAME = 'media'
const DB_VERSION = 1

let dbPromise = null

function openDatabase() {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('This browser does not support local media storage.'))
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error || new Error('Could not open local media storage.'))
    })
  }
  return dbPromise
}

async function transaction(mode, action) {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const store = tx.objectStore(STORE_NAME)
    let result
    try {
      result = action(store)
    } catch (error) {
      reject(error)
      return
    }
    tx.oncomplete = () => resolve(result)
    tx.onerror = () => reject(tx.error || new Error('Local media storage failed.'))
    tx.onabort = () => reject(tx.error || new Error('Local media operation was cancelled.'))
  })
}

export async function saveMediaBlob(blob, fileName = 'file') {
  const key = `media-${Date.now()}-${crypto.randomUUID()}`
  const record = {
    key,
    blob,
    name: fileName,
    type: blob.type || 'application/octet-stream',
    size: blob.size || 0,
    savedAt: new Date().toISOString(),
  }
  await transaction('readwrite', (store) => store.put(record))
  return record
}

export async function getMediaRecord(key) {
  if (!key) return null
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(key)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error || new Error('Could not read local media.'))
  })
}

export async function deleteMediaRecord(key) {
  if (!key) return
  await transaction('readwrite', (store) => store.delete(key))
}

export async function getMediaUrl(key) {
  const record = await getMediaRecord(key)
  if (!record?.blob) return null
  return URL.createObjectURL(record.blob)
}
