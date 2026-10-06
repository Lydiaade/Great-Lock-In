import { useEffect, useRef, useState, useCallback } from 'react'
import { emptyDay } from './challenge'

const DAYS_KEY = 'gli:days'
const BODY_KEY = 'gli:body'

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    console.error('Failed to load', key, e)
    return fallback
  }
}

export function useTrackerData() {
  const [days, setDays] = useState(() => loadJSON(DAYS_KEY, {}))
  const [body, setBody] = useState(() => loadJSON(BODY_KEY, {}))
  const [saveState, setSaveState] = useState('saved')
  const saveTimer = useRef(null)

  const persist = useCallback((nextDays, nextBody) => {
    setSaveState('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DAYS_KEY, JSON.stringify(nextDays))
        localStorage.setItem(BODY_KEY, JSON.stringify(nextBody))
        setSaveState('saved')
      } catch (e) {
        console.error('Save failed', e)
        setSaveState('error')
      }
    }, 300)
  }, [])

  const getDay = useCallback((dateStr) => days[dateStr] || emptyDay(), [days])

  const toggleDayField = useCallback((dateStr, key) => {
    setDays((prev) => {
      const current = prev[dateStr] || emptyDay()
      const next = { ...prev, [dateStr]: { ...current, [key]: !current[key] } }
      persist(next, body)
      return next
    })
  }, [body, persist])

  const setDayNotes = useCallback((dateStr, notes) => {
    setDays((prev) => {
      const current = prev[dateStr] || emptyDay()
      const next = { ...prev, [dateStr]: { ...current, notes } }
      persist(next, body)
      return next
    })
  }, [body, persist])

  const setBodyField = useCallback((checkpointKey, field, value) => {
    setBody((prev) => {
      const current = prev[checkpointKey] || {}
      const next = { ...prev, [checkpointKey]: { ...current, [field]: value } }
      persist(days, next)
      return next
    })
  }, [days, persist])

  const resetAll = useCallback(() => {
    setDays({})
    setBody({})
    try {
      localStorage.removeItem(DAYS_KEY)
      localStorage.removeItem(BODY_KEY)
      setSaveState('saved')
    } catch (e) {
      console.error(e)
    }
  }, [])

  return { days, body, getDay, toggleDayField, setDayNotes, setBodyField, resetAll, saveState }
}
