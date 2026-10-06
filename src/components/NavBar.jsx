const TABS = [
  { key: 'today', label: 'Today', d: 'M9 12l2 2 4-4M M' },
  { key: 'week', label: 'Week' },
  { key: 'totals', label: 'Totals' },
  { key: 'body', label: 'Body' },
]

function Icon({ tab }) {
  if (tab === 'today') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" />
    </svg>
  )
  if (tab === 'week') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  )
  if (tab === 'totals') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="8" cy="8" r="5" /><circle cx="15" cy="14" r="5" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  )
}

export default function NavBar({ tab, setTab }) {
  return (
    <nav className="gli-nav">
      {TABS.map((t) => (
        <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
          <Icon tab={t.key} />
          {t.label}
        </button>
      ))}
    </nav>
  )
}
