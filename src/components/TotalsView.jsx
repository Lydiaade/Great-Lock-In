import { challengeStats } from '../challenge'

export default function TotalsView({ getDay, resetAll }) {
  const s = challengeStats(getDay)
  const tiers = [[26, 28, 100], [23, 25, 70], [20, 22, 40], [0, 19, 0]]

  return (
    <>
      <div className="gli-label">Week by week</div>
      <table className="gli-table">
        <thead>
          <tr><th>Week</th><th>Qual.</th><th>Daily £</th><th>Bonus £</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          {s.weeks.map((w, i) => (
            <tr key={i}>
              <td>Week {i + 1}</td><td>{w.qualifying}/7</td><td>£{w.dailySum}</td><td>£{w.bonus}</td><td>£{w.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="gli-label">End-of-challenge bonus</div>
      <div className="gli-bonuscard">
        {tiers.map((t, i) => {
          const label = t[2] === 0 ? 'Under 20 days' : `${t[0]}–${t[1]} days`
          const hit = s.endBonus === t[2] && (t[2] !== 0 ? s.totalQualifying >= t[0] : s.totalQualifying < 20)
          return (
            <div className={'row' + (hit ? ' hit' : '')} key={i}>
              <span>{label}</span><span>{t[2] ? `+£${t[2]}` : '£0'}</span>
            </div>
          )
        })}
      </div>

      <div className="gli-bonuscard">
        <div className="row"><span>Qualifying days</span><span>{s.totalQualifying} / 28</span></div>
        <div className="row hit"><span>Grand total</span><span className="gli-mono">£{s.grand} / £500</span></div>
      </div>

      <div className="gli-note">
        <b>One judgment call:</b> a &ldquo;qualifying day&rdquo; here means a full £10 day
        (logging + all Tier 1 + all Tier 2 hit), and the £5 weekly floor kicks in just from
        logging all 7 days — £20/£30 are extra tiers on top. The tracker sheet doesn&rsquo;t
        spell either out beyond &ldquo;full detail in the Reward System document,&rdquo; so if
        that document defines things differently, tell me and I&rsquo;ll adjust the math.
      </div>

      <button className="gli-reset" onClick={() => {
        if (window.confirm('This clears every logged day and body measurement. Continue?')) resetAll()
      }}>Reset all tracked data</button>
    </>
  )
}
