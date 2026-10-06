import { useCallback, useEffect, useState } from 'react'
import { greatLockInPreset, newId } from './presets'

const STORE_KEY = 'gli:challenges'
const LEGACY_DAYS_KEY = 'gli:days'
const LEGACY_BODY_KEY = 'gli:body'
const LEGACY_ID = 'great-lock-in-2026'

export const daysKey = (id) => `gli:c:${id}:days`
export const bodyKey = (id) => `gli:c:${id}:body`

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)

    // First run of the multi-challenge version: carry the original tracker's data
    // over into a "Great Lock In" challenge.
    const legacyDays = localStorage.getItem(LEGACY_DAYS_KEY)
    const legacyBody = localStorage.getItem(LEGACY_BODY_KEY)
    if (legacyDays || legacyBody) {
      if (legacyDays) localStorage.setItem(daysKey(LEGACY_ID), legacyDays)
      if (legacyBody) localStorage.setItem(bodyKey(LEGACY_ID), legacyBody)
      const migrated = { challenges: [{ ...greatLockInPreset(), id: LEGACY_ID }], activeId: LEGACY_ID }
      // Write the new store before removing the legacy keys, so a repeat call
      // (e.g. StrictMode double-invoking the initializer) still finds the data.
      localStorage.setItem(STORE_KEY, JSON.stringify(migrated))
      localStorage.removeItem(LEGACY_DAYS_KEY)
      localStorage.removeItem(LEGACY_BODY_KEY)
      return migrated
    }
  } catch (e) {
    console.error('Failed to load challenges', e)
  }
  return { challenges: [], activeId: null }
}

export function useChallenges() {
  const [store, setStore] = useState(loadStore)

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store))
    } catch (e) {
      console.error('Failed to save challenges', e)
    }
  }, [store])

  const active = store.challenges.find((c) => c.id === store.activeId) || store.challenges[0] || null

  const addChallenge = useCallback((config) => {
    const id = newId('c')
    setStore((s) => ({ challenges: [...s.challenges, { ...config, id }], activeId: id }))
  }, [])

  const updateChallenge = useCallback((id, config) => {
    setStore((s) => ({ ...s, challenges: s.challenges.map((c) => (c.id === id ? { ...config, id } : c)) }))
  }, [])

  const deleteChallenge = useCallback((id) => {
    try {
      localStorage.removeItem(daysKey(id))
      localStorage.removeItem(bodyKey(id))
    } catch (e) {
      console.error(e)
    }
    setStore((s) => {
      const challenges = s.challenges.filter((c) => c.id !== id)
      const activeId = s.activeId === id ? (challenges[0]?.id ?? null) : s.activeId
      return { challenges, activeId }
    })
  }, [])

  const setActive = useCallback((id) => setStore((s) => ({ ...s, activeId: id })), [])

  return { challenges: store.challenges, active, addChallenge, updateChallenge, deleteChallenge, setActive }
}
