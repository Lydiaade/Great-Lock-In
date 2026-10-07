import { challengeStats, streakStats, endBonusRows, money } from '../challenge'
import BeforeAfter from './BeforeAfter'

export default function TotalsView({ c, getDay, photos, complete, onCelebrate }) {
  return (
    <>
      {complete && (
        <div className="gli-donecard">
          <div><b>🎉 Challenge complete</b><div className="s">Well done for seeing it through.</div></div>
          <button className="gli-btn" onClick={onCelebrate}>Celebrate again</button>
        </div>
      )}
      {c.rewardMode === 'money' ? <MoneyTotals c={c} getDay={getDay} /> : <StreakTotals c={c} getDay={getDay} />}
      <BeforeAfter c={c} getDay={getDay} photos={photos} />
    </>
  )
}

function MoneyTotals({ c, getDay }) {
  const s = challengeStats(c, getDay)
  const rows = endBonusRows(c)
  const hitIdx = rows.findIndex((r) => s.totalQualifying >= r.min)

  return (
    <>
      <div className="gli-label">Week by week</div>
      <div className="gli-tablewrap">
        <table className="gli-table">
          <thead>
            <tr><th>Week</th><th>Qual.</th><th>Daily</th><th>Bonus</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {s.weeks.map((w, i) => (
              <tr key={i}>
                <td>Week {i + 1}</td><td>{w.qualifying}/{w.dates.length}</td><td>{money(c, w.dailySum)}</td>
                <td>{money(c, w.bonus)}</td><td>{money(c, w.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {c.endBonus.enabled && rows.length > 0 && (
        <>
          <div className="gli-label">End-of-challenge bonus</div>
          <div className="gli-bonuscard">
            {rows.map((r, i) => (
              <div className={'row' + (i === hitIdx ? ' hit' : '')} key={i}>
                <span>{r.label}</span><span>{r.amount ? `+${money(c, r.amount)}` : money(c, 0)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="gli-bonuscard">
        <div className="row"><span>Qualifying days</span><span>{s.totalQualifying} / {c.lengthDays}</span></div>
        <div className="row hit"><span>Grand total</span><span className="gli-mono">{money(c, s.grand)} / {money(c, s.max)}</span></div>
      </div>

      <div className="gli-note">
        A <b>qualifying day</b> means every habit group was completed that day. A rest day counts as a full,
        paid, qualifying day. Holidays pause the challenge
        entirely — the end date moves back so no challenge days are lost.
        {c.weeklyBonus.enabled && (
          <> The weekly bonus applies to full 7-day weeks
            {c.weeklyBonus.gateGroupId ? <> where &ldquo;{c.groups.find((g) => g.id === c.weeklyBonus.gateGroupId)?.name}&rdquo; was done every day</> : null}.</>
        )}
      </div>
    </>
  )
}

function StreakTotals({ c, getDay }) {
  const s = streakStats(c, getDay)
  const need = Math.max(0, s.target - s.completed)

  return (
    <>
      <div className="gli-statgrid">
        <div className="gli-stat">
          <div className="l">Current streak</div>
          <div className="v" style={{ color: 'var(--green)' }}>{s.current} {s.current === 1 ? 'day' : 'days'}</div>
        </div>
        <div className="gli-stat">
          <div className="l">Best streak</div>
          <div className="v">{s.best} {s.best === 1 ? 'day' : 'days'}</div>
        </div>
        <div className="gli-stat">
          <div className="l">Days complete</div>
          <div className="v">{s.completed} / {s.activeDays}</div>
        </div>
        <div className="gli-stat">
          <div className="l">Days left</div>
          <div className="v">{s.daysLeft}</div>
        </div>
      </div>

      <div className="gli-label">The prize</div>
      <div className={'gli-prize' + (s.unlocked ? ' unlocked' : '')}>
        <div className="icon" aria-hidden="true">{s.unlocked ? '🏆' : '🎁'}</div>
        <div>
          <div className="t">{c.streak.prize || 'No prize set yet'}</div>
          <div className="s">
            {s.unlocked
              ? `Unlocked — you completed ${s.completed} days!`
              : !s.stillPossible
                ? `Out of reach this time: ${need} more days needed, ${s.daysLeft} left`
                : `Complete ${s.target} days to unlock · ${need} to go`}
          </div>
        </div>
      </div>
      <div className="gli-progress lg">
        <div className="gli-progress-fill" style={{ width: Math.min(100, (s.completed / s.target) * 100) + '%' }} />
      </div>

      <div className="gli-note">
        A day counts as <b>complete</b> when every habit is ticked. Today stays &ldquo;in progress&rdquo; and
        won&rsquo;t break your current streak until it&rsquo;s over. Rest days count as completed days
        and keep the streak going{s.offTaken ? ` — you've taken ${s.offTaken} so far` : ''}. Holidays pause the whole
        challenge and move the end date back.
      </div>
    </>
  )
}
