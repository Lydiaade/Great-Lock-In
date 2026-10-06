import { WEEKS, DOWS, toDate, dayTotal, weekStats } from '../challenge'

export default function WeekView({ weekIdx, setWeekIdx, getDay }) {
  const w = weekStats(weekIdx, getDay)
  const wk = WEEKS[weekIdx]

  return (
    <>
      <div className="gli-weektabs">
        {WEEKS.map((wkk, i) => (
          <button key={i} className={i === weekIdx ? 'active' : ''} onClick={() => setWeekIdx(i)}>W{wkk.num}</button>
        ))}
      </div>

      <div className="gli-weekhead">
        <div className="t">Week {wk.num}</div>
        <div className="s">Stairmaster {wk.stair} · Plank {wk.plank}</div>
      </div>

      <div className="gli-daylist">
        {w.dates.map((dt) => {
          const d = getDay(dt)
          const total = dayTotal(d)
          const dotClass = total === 10 ? 'full' : total > 0 ? 'part' : ''
          const dateObj = toDate(dt)
          return (
            <div className="gli-daymini" key={dt}>
              <div className={'dot ' + dotClass} />
              <div className="nm">{DOWS[dateObj.getDay()]} {dateObj.getDate()}</div>
              <div className="amt gli-mono">£{total}</div>
            </div>
          )
        })}
      </div>

      <div className="gli-statgrid">
        <div className="gli-stat">
          <div className="l">Logged every day?</div>
          <div className="v" style={{ color: w.loggedAll ? 'var(--green)' : 'var(--ink-faint)' }}>{w.loggedAll ? 'Yes' : 'No'}</div>
        </div>
        <div className="gli-stat">
          <div className="l">Qualifying days</div>
          <div className="v">{w.qualifying} / 7</div>
        </div>
        <div className="gli-stat">
          <div className="l">Daily total</div>
          <div className="v">£{w.dailySum}</div>
        </div>
        <div className="gli-stat">
          <div className="l">Weekly bonus{w.loggedAll ? ' · 7/7 logged unlocks £5+' : ''}</div>
          <div className="v" style={{ color: 'var(--gold)' }}>£{w.bonus}</div>
        </div>
        <div className="gli-stat wide">
          <div className="l">Week subtotal</div>
          <div className="v gli-mono" style={{ color: 'var(--gold)' }}>£{w.subtotal}</div>
        </div>
      </div>
    </>
  )
}
