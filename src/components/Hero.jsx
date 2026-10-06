import { ALL_DATES, fmtISO } from '../challenge'

export default function Hero({ stats, saveState }) {
  const todayIdx = ALL_DATES.indexOf(fmtISO(new Date()))
  const dayLabel = todayIdx >= 0 ? `${todayIdx + 1} / 28` : '– / 28'
  const pct = Math.min(100, (stats.grand / 500) * 100)

  return (
    <div className="gli-hero">
      <div className="gli-hero-top">
        <div>
          <div className="gli-hero-title">The Great Lock In</div>
          <div className="gli-hero-sub">7 Sept – 4 Oct 2026</div>
        </div>
        <div className="gli-hero-sub gli-mono">Day {dayLabel}</div>
      </div>
      <div className="gli-hero-total-row">
        <span className="gli-hero-total">£{stats.grand}</span>
        <span className="gli-hero-max">/ £500 max</span>
      </div>
      <div className="gli-progress"><div className="gli-progress-fill" style={{ width: pct + '%' }} /></div>
      <div className="gli-hero-meta">
        <span>{stats.totalQualifying} / 28 qualifying days</span>
        <span>{saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Save failed' : 'Saved'}</span>
      </div>
    </div>
  )
}
