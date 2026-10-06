import { useRef, useState, useCallback } from 'react'
import { daysKey, bodyKey } from './useChallenges'

const EMPTY_DAY = Object.freeze({})

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.error('Failed to load', key, e)
    return fallback
  }
}

// Day and body data for one challenge. Mount with `key={challengeId}` so switching
// challenges reloads from storage.
export function useTrackerData(challengeId) {
  const [data, setData] = useState(() => ({
    days: loadJSON(daysKey(challengeId), {}),
    body: loadJSON(bodyKey(challengeId), {}),
  }))
  const [saveState, setSaveState] = useState('saved')
  const latest = useRef(data)

  const commit = useCallback((fn) => {
    const next = fn(latest.current)
    latest.current = next
    setData(next)
    try {
      localStorage.setItem(daysKey(challengeId), JSON.stringify(next.days))
      localStorage.setItem(bodyKey(challengeId), JSON.stringify(next.body))
      setSaveState('saved')
    } catch (e) {
      console.error('Save failed', e)
      setSaveState('error')
    }
  }, [challengeId])

  const { days, body } = data
  const getDay = useCallback((dateStr) => days[dateStr] || EMPTY_DAY, [days])

  const toggleDayField = useCallback((dateStr, key) => commit(({ days, body }) => {
    const current = days[dateStr] || {}
    return { body, days: { ...days, [dateStr]: { ...current, [key]: !current[key] } } }
  }), [commit])

  const setDayNotes = useCallback((dateStr, notes) => commit(({ days, body }) => (
    { body, days: { ...days, [dateStr]: { ...(days[dateStr] || {}), notes } } }
  )), [commit])

  const setBodyField = useCallback((checkpointKey, field, value) => commit(({ days, body }) => (
    { days, body: { ...body, [checkpointKey]: { ...(body[checkpointKey] || {}), [field]: value } } }
  )), [commit])

  const resetAll = useCallback(() => commit(() => ({ days: {}, body: {} })), [commit])

  return { body, getDay, toggleDayField, setDayNotes, setBodyField, resetAll, saveState }
}
