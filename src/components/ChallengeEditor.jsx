import { useState } from 'react'
import { fmtShort, toDate, restCfg, maxRewardBreakdown, money, endDate, holidayDaysAdded } from '../challenge'
import { newId } from '../presets'

// The editor works on a "draft": numbers kept as strings and weekly targets as a raw
// comma-separated string, so inputs can be typed into freely. Converted back on save.
function toDraft(c) {
  const habit = (h) => ({ id: h.id, label: h.label, sub: h.sub || '', weeklyText: (h.weekly || []).join(', ') })
  const tiers = (ts) => ts.map((t) => ({ minDays: String(t.minDays), amount: String(t.amount) }))
  return {
    ...c,
    lengthDays: String(c.lengthDays),
    groups: c.groups.map((g) => ({ ...g, value: String(g.value), habits: g.habits.map(habit) })),
    extras: c.extras.map(habit),
    weeklyBonus: { ...c.weeklyBonus, tiers: tiers(c.weeklyBonus.tiers) },
    endBonus: { ...c.endBonus, tiers: tiers(c.endBonus.tiers) },
    streak: { ...c.streak, targetDays: String(c.streak.targetDays) },
    restDays: (({ flexTotal, holidays }) => ({
      flexTotal: String(flexTotal), holidays: holidays.map((h) => ({ ...h, label: h.label || '' })),
    }))(restCfg(c)),
  }
}

function fromDraft(d) {
  const num = (v) => Math.max(0, Number(v) || 0)
  const habits = (hs) => hs
    .filter((h) => h.label.trim())
    .map((h) => ({
      id: h.id, label: h.label.trim(), sub: h.sub.trim(),
      weekly: h.weeklyText.split(',').map((s) => s.trim()).filter(Boolean),
    }))
  const tiers = (ts) => ts.filter((t) => t.minDays !== '').map((t) => ({ minDays: num(t.minDays), amount: num(t.amount) }))
  const lengthDays = Math.round(num(d.lengthDays))
  const groups = d.groups
    .map((g) => ({ id: g.id, name: g.name.trim() || 'Habits', value: num(g.value), habits: habits(g.habits) }))
    .filter((g) => g.habits.length)
  return {
    ...d,
    name: d.name.trim(),
    lengthDays,
    groups,
    extras: habits(d.extras),
    weeklyBonus: {
      ...d.weeklyBonus,
      gateGroupId: groups.some((g) => g.id === d.weeklyBonus.gateGroupId) ? d.weeklyBonus.gateGroupId : '',
      tiers: tiers(d.weeklyBonus.tiers),
    },
    endBonus: { ...d.endBonus, tiers: tiers(d.endBonus.tiers) },
    streak: { prize: d.streak.prize.trim(), targetDays: Math.min(Math.round(num(d.streak.targetDays)) || lengthDays, lengthDays) },
    restDays: {
      flexTotal: Math.min(lengthDays, Math.round(num(d.restDays.flexTotal))),
      holidays: d.restDays.holidays
        .filter((h) => h.start)
        .map((h) => {
          const end = h.end && h.end >= h.start ? h.end : h.start
          return { start: h.start, end, label: h.label.trim() }
        }),
    },
  }
}

function validate(c) {
  if (!c.name) return 'Give the challenge a name.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.startDate) || isNaN(toDate(c.startDate))) return 'Pick a start date.'
  if (c.lengthDays < 1 || c.lengthDays > 366) return 'Length must be between 1 and 366 days.'
  if (!c.groups.length) return 'Add at least one habit.'
  return ''
}

const emptyHabit = () => ({ id: newId('h'), label: '', sub: '', weeklyText: '' })

export default function ChallengeEditor({ initial, isNew, onSave, onCancel }) {
  const [d, setD] = useState(() => toDraft(initial))
  const [error, setError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  // Mutation-style updates on a cloned draft keep the nested edits readable.
  const update = (fn) => setD((prev) => { const n = structuredClone(prev); fn(n); return n })

  const isMoney = d.rewardMode === 'money'
  const len = Math.round(Number(d.lengthDays)) || 0
  // Live previews, from the draft as it would be saved.
  const saved = fromDraft(d)
  const datesOk = len > 0 && len <= 366 && /^\d{4}-\d{2}-\d{2}$/.test(d.startDate)
  const prize = isMoney && datesOk ? maxRewardBreakdown(saved) : null
  const added = datesOk ? holidayDaysAdded(saved) : 0
  const endLabel = datesOk ? fmtShort(endDate(saved)) + (added ? ` (+${added} holiday)` : '') : '—'

  const save = () => {
    const c = fromDraft(d)
    const err = validate(c)
    if (err) { setError(err); return }
    onSave(c)
  }

  return (
    <div className="gli-editor">
      <div className="gli-editor-head">
        {onCancel ? <button className="gli-btn" onClick={onCancel}>Cancel</button> : <span />}
        <div className="t">
          {isNew ? 'New challenge' : 'Edit challenge'}
          {prize && <div className="gli-headmax gli-mono">Up to {money(d, prize.total)}</div>}
        </div>
        <button className="gli-btn primary" onClick={save}>Save</button>
      </div>

      <div className="gli-view">
        {error && <div className="gli-error">{error}</div>}

        <div className="gli-label">Basics</div>
        <div className="gli-card">
          <Field label="Name">
            <input className="gli-input" value={d.name} onChange={(e) => update((n) => { n.name = e.target.value })} />
          </Field>
          <div className="gli-2col">
            <Field label="Start date">
              <input className="gli-input" type="date" value={d.startDate} onChange={(e) => update((n) => { n.startDate = e.target.value })} />
            </Field>
            <Field label={`Length (days) · ends ${endLabel}`}>
              <input className="gli-input" type="number" inputMode="numeric" min="1" max="366" value={d.lengthDays}
                     onChange={(e) => update((n) => { n.lengthDays = e.target.value })} />
            </Field>
          </div>
          <Check label="Track weight & body measurements" on={d.bodyTracking} onChange={(v) => update((n) => { n.bodyTracking = v })} />
        </div>

        <div className="gli-label">Reward</div>
        <div className="gli-seg">
          <button className={isMoney ? 'active' : ''} onClick={() => update((n) => { n.rewardMode = 'money' })}>Money</button>
          <button className={!isMoney ? 'active' : ''} onClick={() => update((n) => { n.rewardMode = 'streak' })}>Streak &amp; prize</button>
        </div>
        <div className="gli-card">
          {isMoney ? (
            <>
              <Field label="Currency symbol">
                <input className="gli-input short" value={d.currency} maxLength={3} onChange={(e) => update((n) => { n.currency = e.target.value })} />
              </Field>
              <div className="gli-hint">Each habit group below earns its amount on days when all its habits are done.</div>
              <MaxPrize c={d} b={prize} />
            </>
          ) : (
            <>
              <Field label="Prize at the end">
                <input className="gli-input" placeholder="e.g. New trainers, spa day…" value={d.streak.prize}
                       onChange={(e) => update((n) => { n.streak.prize = e.target.value })} />
              </Field>
              <Field label={`Days to complete to win (out of ${len || '?'})`}>
                <input className="gli-input short" type="number" inputMode="numeric" min="1" value={d.streak.targetDays}
                       onChange={(e) => update((n) => { n.streak.targetDays = e.target.value })} />
              </Field>
              <div className="gli-hint">A day is complete when every habit below is ticked. Your current and best streaks are tracked too.</div>
            </>
          )}
        </div>

        <div className="gli-label">Habits</div>
        <div className="gli-hint">
          Optional weekly targets step up each week. Put <code>{'{target}'}</code> in the subtitle to place it, e.g. &ldquo;{'{target}'} hold&rdquo;.
        </div>
        {d.groups.map((g, gi) => (
          <div className="gli-card" key={g.id}>
            <div className="gli-grouphead">
              <input className="gli-input grow" placeholder="Group name" value={g.name}
                     onChange={(e) => update((n) => { n.groups[gi].name = e.target.value })} />
              {isMoney && (
                <span className="gli-money-input">
                  {d.currency}
                  <input className="gli-input short" type="number" inputMode="decimal" min="0" value={g.value}
                         onChange={(e) => update((n) => { n.groups[gi].value = e.target.value })} />
                </span>
              )}
              {d.groups.length > 1 && (
                <button className="gli-iconbtn" aria-label="Remove group"
                        onClick={() => update((n) => { n.groups.splice(gi, 1) })}>×</button>
              )}
            </div>
            {g.habits.map((h, hi) => (
              <HabitEditor key={h.id} h={h}
                           onChange={(patch) => update((n) => { Object.assign(n.groups[gi].habits[hi], patch) })}
                           onRemove={() => update((n) => { n.groups[gi].habits.splice(hi, 1) })} />
            ))}
            <button className="gli-addbtn" onClick={() => update((n) => { n.groups[gi].habits.push(emptyHabit()) })}>+ Add habit</button>
          </div>
        ))}
        <button className="gli-addbtn outline" onClick={() => update((n) => {
          n.groups.push({ id: newId('g'), name: `Group ${n.groups.length + 1}`, value: '0', habits: [emptyHabit()] })
        })}>+ Add habit group</button>

        <div className="gli-label">Rest days &amp; holidays <span className="gli-faint">· never break a streak</span></div>
        <div className="gli-hint">
          <b>Rest days</b> count as a full day{isMoney ? ' — paid in full and qualifying' : ' and keep your streak going'},
          so resting as planned never costs you anything.
          {' '}<b>Holidays</b> pause the challenge — the end date moves back and you carry on as if nothing happened.
        </div>
        <div className="gli-card">
          <Field label="Rest days for the whole challenge (use them on any day, from the Today screen)">
            <input className="gli-input short" type="number" inputMode="numeric" min="0" value={d.restDays.flexTotal}
                   onChange={(e) => update((n) => { n.restDays.flexTotal = e.target.value })} />
          </Field>

          <div className="gli-formfield"><span>Holidays</span></div>
          {d.restDays.holidays.map((h, i) => (
            <div className="gli-habitedit" key={i}>
              <div className="row">
                <input className="gli-input grow" placeholder="Label (e.g. Spain trip)" value={h.label}
                       onChange={(e) => update((n) => { n.restDays.holidays[i].label = e.target.value })} />
                <button className="gli-iconbtn" aria-label="Remove holiday"
                        onClick={() => update((n) => { n.restDays.holidays.splice(i, 1) })}>×</button>
              </div>
              <div className="gli-2col tight">
                <label className="gli-formfield"><span>From</span>
                  <input className="gli-input small" type="date" value={h.start}
                         onChange={(e) => update((n) => { n.restDays.holidays[i].start = e.target.value })} />
                </label>
                <label className="gli-formfield"><span>To</span>
                  <input className="gli-input small" type="date" value={h.end} min={h.start}
                         onChange={(e) => update((n) => { n.restDays.holidays[i].end = e.target.value })} />
                </label>
              </div>
            </div>
          ))}
          <button className="gli-addbtn" onClick={() => update((n) => {
            n.restDays.holidays.push({ start: '', end: '', label: '' })
          })}>+ Add holiday</button>
          {added > 0 && <div className="gli-hint">Holidays add {added} day{added === 1 ? '' : 's'} — the challenge now ends {fmtShort(endDate(saved))}.</div>}
        </div>

        <div className="gli-label">Extra tracking <span className="gli-faint">· doesn&rsquo;t count towards the day</span></div>
        <div className="gli-card">
          {d.extras.length === 0 && <div className="gli-hint">Nothing yet — e.g. gym day, progress photo.</div>}
          {d.extras.map((h, hi) => (
            <HabitEditor key={h.id} h={h}
                         onChange={(patch) => update((n) => { Object.assign(n.extras[hi], patch) })}
                         onRemove={() => update((n) => { n.extras.splice(hi, 1) })} />
          ))}
          <button className="gli-addbtn" onClick={() => update((n) => { n.extras.push(emptyHabit()) })}>+ Add extra</button>
        </div>

        {isMoney && (
          <>
            <button className="gli-extra-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? 'Hide bonuses' : 'Weekly & end-of-challenge bonuses'}
            </button>
            {showAdvanced && (
              <>
                <div className="gli-label">Weekly bonus</div>
                <div className="gli-card">
                  <Check label="Enable weekly bonus (full 7-day weeks)" on={d.weeklyBonus.enabled}
                         onChange={(v) => update((n) => { n.weeklyBonus.enabled = v })} />
                  {d.weeklyBonus.enabled && (
                    <>
                      <Field label="Only if this group was done every day of the week">
                        <select className="gli-input" value={d.weeklyBonus.gateGroupId}
                                onChange={(e) => update((n) => { n.weeklyBonus.gateGroupId = e.target.value })}>
                          <option value="">No requirement</option>
                          {d.groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </Field>
                      <TierEditor tiers={d.weeklyBonus.tiers} currency={d.currency} unit="qualifying days in the week"
                                  onChange={(fn) => update((n) => fn(n.weeklyBonus.tiers))} />
                    </>
                  )}
                </div>

                <div className="gli-label">End-of-challenge bonus</div>
                <div className="gli-card">
                  <Check label="Enable end-of-challenge bonus" on={d.endBonus.enabled}
                         onChange={(v) => update((n) => { n.endBonus.enabled = v })} />
                  {d.endBonus.enabled && (
                    <TierEditor tiers={d.endBonus.tiers} currency={d.currency} unit="qualifying days in total"
                                onChange={(fn) => update((n) => fn(n.endBonus.tiers))} />
                  )}
                </div>
                <div className="gli-hint">A qualifying day = every habit group completed. The highest tier reached pays out.</div>
              </>
            )}
          </>
        )}

        <button className="gli-btn primary block" onClick={save}>Save challenge</button>
      </div>
    </div>
  )
}

function MaxPrize({ c, b }) {
  const rows = [
    [`Daily · ${money(c, b.perDay)} × ${b.days} days`, b.daily],
    ...(b.weekly ? [[`Weekly bonus · ${money(c, b.weeklyTop)} × ${b.fullWeeks} full week${b.fullWeeks === 1 ? '' : 's'}`, b.weekly]] : []),
    ...(b.end ? [['End-of-challenge bonus (top tier)', b.end]] : []),
  ]
  return (
    <div className="gli-maxprize">
      <div className="hd">
        <span>Total that can be won</span>
        <span className="v gli-mono">{money(c, b.total)}</span>
      </div>
      {rows.map(([label, amount]) => (
        <div className="row" key={label}><span>{label}</span><span className="gli-mono">{money(c, amount)}</span></div>
      ))}
      <div className="note">
        Every day qualifying, hitting the top bonus tiers. Rest days and holidays don&rsquo;t reduce it —
        rest days pay in full, and holidays just move the end date.
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="gli-formfield">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Check({ label, on, onChange }) {
  return (
    <label className="gli-check">
      <input type="checkbox" checked={!!on} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function HabitEditor({ h, onChange, onRemove }) {
  return (
    <div className="gli-habitedit">
      <div className="row">
        <input className="gli-input grow" placeholder="Habit (e.g. 10,000 steps)" value={h.label}
               onChange={(e) => onChange({ label: e.target.value })} />
        <button className="gli-iconbtn" aria-label="Remove habit" onClick={onRemove}>×</button>
      </div>
      <input className="gli-input small" placeholder="Subtitle (optional)" value={h.sub}
             onChange={(e) => onChange({ sub: e.target.value })} />
      <input className="gli-input small" placeholder="Weekly targets (optional), e.g. 60 sec, 70 sec, 80 sec" value={h.weeklyText}
             onChange={(e) => onChange({ weeklyText: e.target.value })} />
    </div>
  )
}

function TierEditor({ tiers, currency, unit, onChange }) {
  return (
    <div className="gli-tiers">
      <div className="gli-hint">Bonus for reaching this many {unit}:</div>
      {tiers.map((t, i) => (
        <div className="gli-tier" key={i}>
          <input className="gli-input short" type="number" inputMode="numeric" min="0" value={t.minDays}
                 onChange={(e) => onChange((ts) => { ts[i].minDays = e.target.value })} />
          <span>+ days →</span>
          <span className="gli-money-input">
            {currency}
            <input className="gli-input short" type="number" inputMode="decimal" min="0" value={t.amount}
                   onChange={(e) => onChange((ts) => { ts[i].amount = e.target.value })} />
          </span>
          <button className="gli-iconbtn" aria-label="Remove tier" onClick={() => onChange((ts) => { ts.splice(i, 1) })}>×</button>
        </div>
      ))}
      <button className="gli-addbtn" onClick={() => onChange((ts) => { ts.push({ minDays: '', amount: '' }) })}>+ Add tier</button>
    </div>
  )
}
