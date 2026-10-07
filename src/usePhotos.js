import { useCallback, useEffect, useRef, useState } from 'react'
import { PHASES, VIEWS, photoKey, getPhoto, putPhoto, deletePhoto, deleteChallengePhotos, prepareImage } from './photoStore'

// Before/after photos for one challenge, as object URLs keyed `${phase}:${view}`.
export function usePhotos(challengeId) {
  const [urls, setUrls] = useState({})
  const [busy, setBusy] = useState(null) // slot currently being saved
  const [error, setError] = useState('')
  const urlsRef = useRef({})

  const replaceUrl = useCallback((slot, blob) => {
    const prev = urlsRef.current[slot]
    if (prev) URL.revokeObjectURL(prev)
    const next = { ...urlsRef.current }
    if (blob) next[slot] = URL.createObjectURL(blob)
    else delete next[slot]
    urlsRef.current = next
    setUrls(next)
  }, [])

  useEffect(() => {
    let cancelled = false
    const slots = PHASES.flatMap((p) => VIEWS.map((v) => [p.key, v.key]))
    Promise.all(slots.map(([p, v]) => getPhoto(photoKey(challengeId, p, v)).catch(() => null)))
      .then((blobs) => {
        if (cancelled) return
        blobs.forEach((b, i) => { if (b) replaceUrl(slots[i].join(':'), b) })
      })
    return () => {
      cancelled = true
      Object.values(urlsRef.current).forEach((u) => URL.revokeObjectURL(u))
      urlsRef.current = {}
    }
  }, [challengeId, replaceUrl])

  const setPhoto = useCallback(async (phase, view, file) => {
    const slot = `${phase}:${view}`
    setBusy(slot); setError('')
    try {
      const blob = await prepareImage(file)
      await putPhoto(photoKey(challengeId, phase, view), blob)
      replaceUrl(slot, blob)
    } catch (e) {
      console.error(e)
      setError(e.message || 'Could not save that photo')
    } finally {
      setBusy(null)
    }
  }, [challengeId, replaceUrl])

  const removePhoto = useCallback(async (phase, view) => {
    await deletePhoto(photoKey(challengeId, phase, view)).catch(console.error)
    replaceUrl(`${phase}:${view}`, null)
  }, [challengeId, replaceUrl])

  const clearAll = useCallback(async () => {
    await deleteChallengePhotos(challengeId).catch(console.error)
    Object.keys(urlsRef.current).forEach((slot) => replaceUrl(slot, null))
  }, [challengeId, replaceUrl])

  return { urls, busy, error, setPhoto, removePhoto, clearAll }
}
