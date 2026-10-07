// Progress photos live in IndexedDB (localStorage is ~5MB and can't hold images).
// Stored as { type, buf: ArrayBuffer } — plain ArrayBuffers are the most reliable
// thing to put in IndexedDB across browsers, including iOS Safari.

const DB_NAME = 'gli-photos'
const STORE = 'photos'

export const PHASES = [
  { key: 'start', label: 'Before' },
  { key: 'end', label: 'After' },
]
export const VIEWS = [
  { key: 'front', label: 'Front' },
  { key: 'side', label: 'Side' },
  { key: 'back', label: 'Back' },
]

export const photoKey = (challengeId, phase, view) => `${challengeId}:${phase}:${view}`

let dbPromise = null
function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    dbPromise.catch(() => { dbPromise = null })
  }
  return dbPromise
}

async function run(mode, fn) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = fn(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(req?.result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function getPhoto(key) {
  const rec = await run('readonly', (s) => s.get(key))
  return rec ? new Blob([rec.buf], { type: rec.type }) : null
}

export async function putPhoto(key, blob) {
  const buf = await blob.arrayBuffer()
  await run('readwrite', (s) => s.put({ type: blob.type, buf }, key))
}

export function deletePhoto(key) {
  return run('readwrite', (s) => s.delete(key))
}

export async function deleteChallengePhotos(challengeId) {
  const keys = (await run('readonly', (s) => s.getAllKeys())) || []
  const mine = keys.filter((k) => String(k).startsWith(challengeId + ':'))
  if (mine.length) await run('readwrite', (s) => { mine.forEach((k) => s.delete(k)) })
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read that image'))
    img.src = src
  })
}

// Shrink a picked photo (phone photos are several MB) to a JPEG of at most `max` px.
export async function prepareImage(file, max = 1400) {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process that image'))), 'image/jpeg', 0.85))
  } finally {
    URL.revokeObjectURL(url)
  }
}
