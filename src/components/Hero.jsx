import { challengeStats, streakStats, dayIndex, todayISO, fmtRange, money, pausedToday } from '../challenge'

export default function Hero({ c, getDay, saveState, onHelp }) {
  const idx = dayIndex(c, todayISO())
  const paused = pausedToday(c)
  const dayLabel = idx < 0 ? `Starts in ${-idx}d`
    : idx >= c.lengthDays ? 'Finished'
    : paused ? `🌴 Paused · ${paused.label || 'holiday'}`
    : `Day ${idx + 1} / ${c.lengthDays}`
  const saveLabel = saveState === 'error' ? 'Save failed' : 'Saved'

  return (
    <div className="gli-hero">
      <div className="gli-hero-top">
        <div>
          <div className="gli-hero-title">{c.name}</div>
          <div className="gli-hero-sub">{fmtRange(c)}</div>
        </div>
        <div className="gli-hero-right">
          <div className="gli-hero-sub gli-mono">{dayLabel}</div>
          {onHelp && <button className="gli-helpbtn" onClick={onHelp} aria-label="How it works">?</button>}
        </div>
      </div>
      {c.rewardMode === 'money' ? <MoneyHero c={c} getDay={getDay} saveLabel={saveLabel} />
                                : <StreakHero c={c} getDay={getDay} saveLabel={saveLabel} />}
    </div>
  )
}

function MoneyHero({ c, getDay, saveLabel }) {
  const s = challengeStats(c, getDay)
  const pct = s.max ? Math.min(100, (s.grand / s.max) * 100) : 0
  return (
    <>
      <div className="gli-hero-total-row">
        <span className="gli-hero-total">{money(c, s.grand)}</span>
        <span className="gli-hero-max">/ {money(c, s.max)} max</span>
      </div>
      <div className="gli-progress"><div className="gli-progress-fill" style={{ width: pct + '%' }} /></div>
      <div className="gli-hero-meta">
        <span>{s.totalQualifying} / {c.lengthDays} qualifying days</span>
        <span>{saveLabel}</span>
      </div>
    </>
  )
}

function StreakHero({ c, getDay, saveLabel }) {
  const s = streakStats(c, getDay)
  const pct = Math.min(100, (s.completed / s.target) * 100)
  return (
    <>
      <div className="gli-hero-total-row">
        <span className="gli-hero-total streak">{s.current}</span>
        <span className="gli-hero-max">day streak · best {s.best}</span>
      </div>
      <div className="gli-progress"><div className="gli-progress-fill" style={{ width: pct + '%' }} /></div>
      <div className="gli-hero-meta">
        <span>{s.completed} / {s.target} days{c.streak.prize ? ` → ${c.streak.prize}` : ''}</span>
        <span>{saveLabel}</span>
      </div>
    </>
  )
}
