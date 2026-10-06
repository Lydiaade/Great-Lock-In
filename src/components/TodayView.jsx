import { useState } from 'react'
import { DOWS, MONTHS, challengeDates, toDate, dayTotal, dayIsFull, groupDone, habitSub, habitsDone, allHabits, weekTarget, money, effectiveDay, plannedOff, restInfo, REST_FIELD, holidayBefore, fmtShort } from '../challenge'
import ToggleRow from './ToggleRow'

export default function TodayView({ c, dayIdx, setDayIdx, getDay, toggleDayField, setDayNotes }) {
  const [extrasOpen, setExtrasOpen] = useState(false)
  const dateStr = challengeDates(c)[dayIdx]
  const raw = getDay(dateStr)
  const wkIdx = Math.floor(dayIdx / 7)
  const dt = toDate(dateStr)
  const isMoney = c.rewardMode === 'money'
  const gateId = c.weeklyBonus.enabled ? c.weeklyBonus.gateGroupId : null

  const targets = allHabits(c)
    .map((h) => [h.label, weekTarget(h, wkIdx)])
    .filter(([, t]) => t)
    .map(([l, t]) => `${l.toLowerCase()} ${t}`)

  const planned = plannedOff(c, dateStr)
  const rest = restInfo(c, getDay)
  const off = rest.map.get(dateStr)
  // Scored view of the day: a rest day counts as every habit done.
  const d = effectiveDay(c, raw, !!off)
  const { done, total } = habitsDone(c, d)
  const full = dayIsFull(c, d)
  const flexOn = !!off?.flexible
  // Can mark this day as rest if it isn't a fixed rest day and the allowance isn't used up.
  const canFlex = !planned && rest.flexTotal > 0 && (flexOn || rest.flexLeft > 0)
  const pausedBefore = holidayBefore(c, dayIdx)

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

      {pausedBefore && (
        <div className="gli-pausechip">
          🌴 Challenge paused for {pausedBefore.label || 'holiday'} · {fmtShort(pausedBefore.from)}
          {pausedBefore.to !== pausedBefore.from ? `–${fmtShort(pausedBefore.to)}` : ''} · picks up here
        </div>
      )}

      {off && (
        <div className="gli-offbanner">
          <div className="icon" aria-hidden="true">😴</div>
          <div>
            <div className="t">{off.label} — counts as a full day</div>
            <div className="s">
              {isMoney ? 'Paid in full and qualifying. Habits are optional today.' : 'Your streak keeps going. Habits are optional today.'}
            </div>
          </div>
        </div>
      )}

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

      {rest.flexTotal > 0 && !planned && (
        <ToggleRow variant="rest" on={flexOn}
                   label="Take a rest day"
                   sub={canFlex
                     ? `${rest.flexLeft} of ${rest.flexTotal} left for the challenge${flexOn ? ' · using one' : ''}`
                     : `All ${rest.flexTotal} used`}
                   onClick={() => { if (canFlex) toggleDayField(dateStr, REST_FIELD) }} />
      )}

      {c.groups.map((g) => (
        <div key={g.id}>
          <div className="gli-label">
            {g.name}
            {isMoney && (g.habits.length > 1
              ? ` · ${money(c, g.value)} if all ${g.habits.length} are hit`
              : ` · ${money(c, g.value)}`)}
          </div>
          {g.habits.map((h) => {
            const excused = off && !raw[h.id]
            return (
              <ToggleRow key={h.id} variant={excused ? 'excused' : g.id === gateId ? 'gate' : undefined} on={!!raw[h.id]}
                         label={h.label} sub={excused ? 'Excused — rest day' : habitSub(h, wkIdx)}
                         onClick={() => toggleDayField(dateStr, h.id)} />
            )
          })}
        </div>
      ))}

      {c.extras.length > 0 && (
        <>
          <div className="gli-extra-toggle" onClick={() => setExtrasOpen(!extrasOpen)}>
            {extrasOpen ? 'Hide extra tracking' : `Extra tracking (${c.extras.filter((h) => raw[h.id]).length}/${c.extras.length})`}
          </div>
          <div className={'gli-extras' + (extrasOpen ? ' open' : '')}>
            {c.extras.map((h) => (
              <ToggleRow key={h.id} on={!!raw[h.id]} label={h.label} sub={habitSub(h, wkIdx)}
                         onClick={() => toggleDayField(dateStr, h.id)} />
            ))}
          </div>
        </>
      )}

      <div className="gli-label">Notes</div>
      <textarea className="gli-notes" placeholder="Anything worth remembering about today…"
                value={raw.notes || ''} onChange={(e) => setDayNotes(dateStr, e.target.value)} />
    </>
  )
}
