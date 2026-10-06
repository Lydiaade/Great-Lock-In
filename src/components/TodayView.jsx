import { useState } from 'react'
import { DOWS, MONTHS, WEEKS, ALL_DATES, toDate, weekOfDate, dayTotal, DAY_FIELDS_TIER1, tier2Fields } from '../challenge'
import ToggleRow from './ToggleRow'

export default function TodayView({ dayIdx, setDayIdx, getDay, toggleDayField, setDayNotes }) {
  const [extrasOpen, setExtrasOpen] = useState(false)
  const dateStr = ALL_DATES[dayIdx]
  const d = getDay(dateStr)
  const wkIdx = weekOfDate(dateStr)
  const wk = WEEKS[wkIdx]
  const dt = toDate(dateStr)
  const total = dayTotal(d)
  const t1 = d.cal && d.steps && d.water && d.fast
  const t2 = d.protein && d.fibre && d.nojunk && d.plank

  return (
    <>
      <div className="gli-daynav">
        <button disabled={dayIdx === 0} onClick={() => setDayIdx(dayIdx - 1)}>&#8249;</button>
        <div className="gli-daydate">
          <div className="dow">{DOWS[dt.getDay()]}</div>
          <div className="full gli-mono">{dt.getDate()} {MONTHS[dt.getMonth()]}</div>
        </div>
        <button disabled={dayIdx === 27} onClick={() => setDayIdx(dayIdx + 1)}>&#8250;</button>
      </div>
      <div className="gli-weekchip">Week {wk.num} · stairmaster {wk.stair} · plank {wk.plank}</div>

      <div className="gli-daytotal">
        <div>
          <div className="l">Today&rsquo;s total</div>
          <div className="breakdown">£{d.logged ? 2 : 0} log + £{t1 ? 4 : 0} tier 1 + £{t2 ? 4 : 0} tier 2</div>
        </div>
        <div className="v gli-mono">£{total}</div>
      </div>

      <ToggleRow variant="logged" on={d.logged} label="Food logged" sub="Worth £2 on its own"
                 onClick={() => toggleDayField(dateStr, 'logged')} />

      <div className="gli-label">Tier 1 · £4 if all four are hit</div>
      {DAY_FIELDS_TIER1.map((f) => (
        <ToggleRow key={f.key} on={d[f.key]} label={f.label} sub={f.sub} onClick={() => toggleDayField(dateStr, f.key)} />
      ))}

      <div className="gli-label">Tier 2 · £4 if all four are hit</div>
      {tier2Fields(wkIdx).map((f) => (
        <ToggleRow key={f.key} on={d[f.key]} label={f.label} sub={f.sub} onClick={() => toggleDayField(dateStr, f.key)} />
      ))}

      <div className="gli-extra-toggle" onClick={() => setExtrasOpen(!extrasOpen)}>
        {extrasOpen ? 'Hide extra tracking' : 'Gym day, weigh-in & photo'}
      </div>
      <div className={'gli-extras' + (extrasOpen ? ' open' : '')}>
        <ToggleRow on={d.liftday} label="Lift day" sub="Lifting + stairmaster session" onClick={() => toggleDayField(dateStr, 'liftday')} />
        <ToggleRow on={d.stairmaster} label="Stairmaster done" sub={wk.stair} onClick={() => toggleDayField(dateStr, 'stairmaster')} />
        <ToggleRow on={d.weighin} label="Weigh-in logged" onClick={() => toggleDayField(dateStr, 'weighin')} />
        <ToggleRow on={d.photo} label="Progress photo" onClick={() => toggleDayField(dateStr, 'photo')} />
        <ToggleRow on={d.measure} label="Measurements taken" onClick={() => toggleDayField(dateStr, 'measure')} />
        <ToggleRow on={d.periodDay} label="Period day (extra allowance)"
                    sub="Choose up to 2 days: 2,500 kcal ceiling, chocolate/popcorn OK"
                    onClick={() => toggleDayField(dateStr, 'periodDay')} />
      </div>

      <div className="gli-label">Notes</div>
      <textarea className="gli-notes" placeholder="Anything worth remembering about today…"
                value={d.notes || ''} onChange={(e) => setDayNotes(dateStr, e.target.value)} />
    </>
  )
}
