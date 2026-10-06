import { DOWS, toDate, dayTotal, dayIsFull, habitsDone, weekStats, weekCount, allHabits, weekTarget, money } from '../challenge'

export default function WeekView({ c, weekIdx, setWeekIdx, getDay }) {
  const w = weekStats(c, weekIdx, getDay)
  const isMoney = c.rewardMode === 'money'
  const targets = allHabits(c).map((h) => [h.label, weekTarget(h, weekIdx)]).filter(([, t]) => t)

  return (
    <>
      <div className="gli-weektabs">
        {Array.from({ length: weekCount(c) }, (_, i) => (
          <button key={i} className={i === weekIdx ? 'active' : ''} onClick={() => setWeekIdx(i)}>W{i + 1}</button>
        ))}
      </div>

      <div className="gli-weekhead">
        <div className="t">Week {weekIdx + 1}</div>
        {targets.length > 0 && <div className="s">{targets.map(([l, t]) => `${l} ${t}`).join(' · ')}</div>}
      </div>

      <div className="gli-daylist">
        {w.dates.map((dt) => {
          const d = getDay(dt)
          const { done, total } = habitsDone(c, d)
          const full = dayIsFull(c, d)
          const dotClass = full ? 'full' : done > 0 ? 'part' : ''
          const dateObj = toDate(dt)
          return (
            <div className="gli-daymini" key={dt}>
              <div className={'dot ' + dotClass} />
              <div className="nm">{DOWS[dateObj.getDay()]} {dateObj.getDate()}</div>
              <div className="amt gli-mono">{isMoney ? money(c, dayTotal(c, d)) : `${done}/${total}`}</div>
            </div>
          )
        })}
      </div>

      {isMoney ? (
        <div className="gli-statgrid">
          {w.gate && (
            <div className="gli-stat">
              <div className="l">{w.gate.name} every day?</div>
              <div className="v" style={{ color: w.gateAll ? 'var(--green)' : 'var(--ink-faint)' }}>{w.gateAll ? 'Yes' : 'No'}</div>
            </div>
          )}
          <div className={'gli-stat' + (w.gate ? '' : ' wide')}>
            <div className="l">Qualifying days</div>
            <div className="v">{w.qualifying} / {w.dates.length}</div>
          </div>
          <div className="gli-stat">
            <div className="l">Daily total</div>
            <div className="v">{money(c, w.dailySum)}</div>
          </div>
          <div className="gli-stat">
            <div className="l">Weekly bonus{!c.weeklyBonus.enabled ? ' · off' : !w.isFullWeek ? ' · full weeks only' : ''}</div>
            <div className="v" style={{ color: 'var(--gold)' }}>{money(c, w.bonus)}</div>
          </div>
          <div className="gli-stat wide">
            <div className="l">Week subtotal</div>
            <div className="v gli-mono" style={{ color: 'var(--gold)' }}>{money(c, w.subtotal)}</div>
          </div>
        </div>
      ) : (
        <div className="gli-statgrid">
          <div className="gli-stat wide">
            <div className="l">Days complete this week</div>
            <div className="v gli-mono" style={{ color: 'var(--green)' }}>{w.qualifying} / {w.dates.length}</div>
          </div>
        </div>
      )}
    </>
  )
}
