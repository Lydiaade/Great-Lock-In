import { useState } from 'react'
import { DOWS, MONTHS, challengeDates, toDate, dayTotal, dayIsFull, groupDone, habitSub, habitsDone, allHabits, weekTarget, money } from '../challenge'
import ToggleRow from './ToggleRow'

export default function TodayView({ c, dayIdx, setDayIdx, getDay, toggleDayField, setDayNotes }) {
  const [extrasOpen, setExtrasOpen] = useState(false)
  const dateStr = challengeDates(c)[dayIdx]
  const d = getDay(dateStr)
  const wkIdx = Math.floor(dayIdx / 7)
  const dt = toDate(dateStr)
  const isMoney = c.rewardMode === 'money'
  const gateId = c.weeklyBonus.enabled ? c.weeklyBonus.gateGroupId : null

  const targets = allHabits(c)
    .map((h) => [h.label, weekTarget(h, wkIdx)])
    .filter(([, t]) => t)
    .map(([l, t]) => `${l.toLowerCase()} ${t}`)

  const { done, total } = habitsDone(c, d)
  const full = dayIsFull(c, d)

  return (
    <>
      <div className="gli-daynav">
        <button disabled={dayIdx === 0} onClick={() => setDayIdx(dayIdx - 1)} aria-label="Previous day">&#8249;</button>
        <div className="gli-daydate">
          <div className="dow">{DOWS[dt.getDay()]}</div>
          <div className="full gli-mono">{dt.getDate()} {MONTHS[dt.getMonth()]} · day {dayIdx + 1}/{c.lengthDays}</div>
        </div>
        <button disabled={dayIdx === c.lengthDays - 1} onClick={() => setDayIdx(dayIdx + 1)} aria-label="Next day">&#8250;</button>
      </div>
      <div className="gli-weekchip">{['Week ' + (wkIdx + 1), ...targets].join(' · ')}</div>

      {isMoney ? (
        <div className="gli-daytotal">
          <div>
            <div className="l">Today&rsquo;s total</div>
            <div className="breakdown">
              {c.groups.map((g) => `${money(c, groupDone(g, d) ? g.value : 0)} ${g.name.toLowerCase()}`).join(' + ')}
            </div>
          </div>
          <div className="v gli-mono">{money(c, dayTotal(c, d))}</div>
        </div>
      ) : (
        <div className={'gli-daytotal' + (full ? ' complete' : '')}>
          <div>
            <div className="l">{full ? 'Day complete — streak kept' : 'Complete every habit to keep the streak'}</div>
            <div className="breakdown">{done} of {total} habits done</div>
          </div>
          <div className="v gli-mono">{full ? '✓' : `${done}/${total}`}</div>
        </div>
      )}

      {c.groups.map((g) => (
        <div key={g.id}>
          <div className="gli-label">
            {g.name}
            {isMoney && (g.habits.length > 1
              ? ` · ${money(c, g.value)} if all ${g.habits.length} are hit`
              : ` · ${money(c, g.value)}`)}
          </div>
          {g.habits.map((h) => (
            <ToggleRow key={h.id} variant={g.id === gateId ? 'gate' : undefined} on={!!d[h.id]}
                       label={h.label} sub={habitSub(h, wkIdx)} onClick={() => toggleDayField(dateStr, h.id)} />
          ))}
        </div>
      ))}

      {c.extras.length > 0 && (
        <>
          <div className="gli-extra-toggle" onClick={() => setExtrasOpen(!extrasOpen)}>
            {extrasOpen ? 'Hide extra tracking' : `Extra tracking (${c.extras.filter((h) => d[h.id]).length}/${c.extras.length})`}
          </div>
          <div className={'gli-extras' + (extrasOpen ? ' open' : '')}>
            {c.extras.map((h) => (
              <ToggleRow key={h.id} on={!!d[h.id]} label={h.label} sub={habitSub(h, wkIdx)}
                         onClick={() => toggleDayField(dateStr, h.id)} />
            ))}
          </div>
        </>
      )}

      <div className="gli-label">Notes</div>
      <textarea className="gli-notes" placeholder="Anything worth remembering about today…"
                value={d.notes || ''} onChange={(e) => setDayNotes(dateStr, e.target.value)} />
    </>
  )
}
