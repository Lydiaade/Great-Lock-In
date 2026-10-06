const ICONS = {
  today: <><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></>,
  week: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  totals: <><circle cx="8" cy="8" r="5" /><circle cx="15" cy="14" r="5" /></>,
  streak: <path d="M12 3c1 4 5 5.5 5 10a5 5 0 01-10 0c0-2.5 1.5-3.5 2-5 1 1.5 2 2 2 2s-.5-3.5 1-7z" />,
  body: <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></>,
}

export default function NavBar({ tab, setTab, c }) {
  const tabs = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'totals', label: c.rewardMode === 'money' ? 'Totals' : 'Progress', icon: c.rewardMode === 'money' ? 'totals' : 'streak' },
    ...(c.bodyTracking ? [{ key: 'body', label: 'Body' }] : []),
    { key: 'settings', label: 'Settings' },
  ]
  return (
    <nav className="gli-nav">
      {tabs.map((t) => (
        <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {ICONS[t.icon || t.key]}
          </svg>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
