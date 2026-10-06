import { useEffect, useState } from 'react'

const THEME_KEY = 'gli:theme'
const META_COLORS = { dark: '#101613', light: '#F4F1E9' }

function loadPref() {
  try {
    return localStorage.getItem(THEME_KEY) || 'system'
  } catch {
    return 'system'
  }
}

// pref: 'system' | 'light' | 'dark'. Resolved theme is stamped on <html data-theme>.
export function useTheme() {
  const [pref, setPref] = useState(loadPref)

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, pref) } catch { /* ignore */ }
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const apply = () => {
      const theme = pref === 'system' ? (mq.matches ? 'light' : 'dark') : pref
      document.documentElement.dataset.theme = theme
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme])
    }
    apply()
    if (pref !== 'system') return
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [pref])

  return [pref, setPref]
}
