import { fmtRange, fmtShort, money, restCfg, endBonusRows, maxRewardBreakdown, holidayDaysAdded, allHabits, weekTarget } from '../challenge'

// Plain-language explanation of the rules. When a challenge is passed in, examples use
// its real numbers; without one (welcome screen) it stays general.
export default function GuideView({ c, onClose }) {
  const isMoney = c ? c.rewardMode === 'money' : null

  return (
    <div className="gli-guide">
      {onClose && (
        <button className="gli-btn gli-guide-back" onClick={onClose}>&#8249; Back</button>
      )}
      <div className="gli-guide-title">How it works</div>
      <p className="gli-guide-lead">
        {c
          ? <>You&rsquo;re looking at <b>{c.name}</b> ({fmtRange(c)}). Tap a section to open it.</>
          : <>A quick tour of how challenges work. Tap a section to open it.</>}
      </p>

      <Section title="The basics" open>
        <p>
          A challenge is a set number of <b>challenge days</b>{c ? <> — <b>{c.lengthDays}</b> for this one</> : null}.
          Each day you open <b>Today</b> and tick off the habits you did.
        </p>
        <p>
          Habits sit in <b>groups</b>{c ? <> (yours: {c.groups.map((g) => g.name).join(', ')})</> : null}.
          A day is <b>complete</b> — also called a <b>qualifying day</b> — when every habit in every group is ticked.
        </p>
        <WeeklyTargets c={c} />
        <p>
          <b>Week</b> shows each 7-day block at a glance: <Dot cls="full" /> complete, <Dot cls="part" /> partly done,
          <Dot /> nothing ticked yet.
        </p>
      </Section>

      {(isMoney === null || isMoney) && <MoneySection c={isMoney ? c : null} />}
      {(isMoney === null || !isMoney) && <StreakSection c={isMoney === false ? c : null} />}

      <RestSection c={c} isMoney={isMoney} />
      <HolidaySection c={c} />

      <Section title="Extras, body & notes">
        <p>
          <b>Extra tracking</b> (under the habits on Today) is for things you want to record — gym day, progress
          photo — that <b>don&rsquo;t</b> count towards completing the day.
        </p>
        <p>
          <b>Body</b> (if switched on) has a card for the start and the end of each week to log weight and
          measurements. <b>Notes</b> on Today are just for you.
        </p>
      </Section>

      <Section title="Settings & your data">
        <p>
          In <b>Settings</b> you can edit a challenge (dates, habits, rewards, rest days), start a new one from a
          template, duplicate one to reuse its setup, or switch between challenges. Each challenge keeps its own data.
        </p>
        <p>
          Everything is saved <b>only on this device</b>. Clearing your browser&rsquo;s site data, or moving to a new
          phone, starts you from scratch.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, open, children }) {
  return (
    <details className="gli-guide-sec" open={open}>
      <summary>{title}</summary>
      <div className="body">{children}</div>
    </details>
  )
}

function Dot({ cls }) {
  return <span className={'gli-guide-dot ' + (cls || '')} aria-hidden="true" />
}

function WeeklyTargets({ c }) {
  const h = c && allHabits(c).find((x) => (x.weekly || []).filter(Boolean).length > 1)
  return (
    <p>
      Some habits can <b>step up each week</b>
      {h
        ? <> — e.g. <b>{h.label}</b> goes {h.weekly.filter(Boolean).map((_, i) => weekTarget(h, i)).join(' → ')}</>
        : <> (e.g. a plank going 60 → 70 → 80 sec)</>}
      . The current week&rsquo;s target is shown under the habit and at the top of Today.
    </p>
  )
}

function MoneySection({ c }) {
  const b = c && maxRewardBreakdown(c)
  const rows = c ? endBonusRows(c) : []
  const gate = c?.weeklyBonus.gateGroupId && c.groups.find((g) => g.id === c.weeklyBonus.gateGroupId)
  const tiers = c ? [...c.weeklyBonus.tiers].sort((a, b) => b.minDays - a.minDays) : []

  return (
    <Section title="Earning money" open={!!c}>
      <p><b>1. Every day</b> — each group pays out when <i>all</i> of its habits are ticked that day:</p>
      {c ? (
        <ul>
          {c.groups.map((g) => (
            <li key={g.id}>
              <b>{g.name}</b>: {money(c, g.value)}{g.habits.length > 1 ? ` if all ${g.habits.length} habits are done` : ''}
            </li>
          ))}
          <li>So a perfect day earns <b>{money(c, b.perDay)}</b>.</li>
        </ul>
      ) : (
        <p>Miss one habit in a group and that group pays nothing for the day — the other groups still pay.</p>
      )}

      <p>
        <b>2. Weekly bonus</b> —{' '}
        {c && !c.weeklyBonus.enabled ? 'switched off for this challenge.' : (
          <>
            paid at the end of each full 7-day week, based on how many qualifying days you had
            {gate ? <>, as long as <b>{gate.name}</b> was done every single day that week</> : null}.
            {c && tiers.length > 0 && (
              <span className="gli-guide-tiers">
                {tiers.map((t) => <span key={t.minDays}>{t.minDays}+ days → {money(c, t.amount)}</span>)}
              </span>
            )}
          </>
        )}
      </p>

      <p>
        <b>3. End-of-challenge bonus</b> —{' '}
        {c && !c.endBonus.enabled ? 'switched off for this challenge.' : (
          <>
            a one-off payout based on your total qualifying days. Only the highest tier you reach pays.
            {c && rows.length > 0 && (
              <span className="gli-guide-tiers">
                {rows.filter((r) => r.amount).map((r) => <span key={r.min}>{r.label} → {money(c, r.amount)}</span>)}
              </span>
            )}
          </>
        )}
      </p>

      {c && (
        <div className="gli-guide-example">
          <b>Most you can win: {money(c, b.total)}</b><br />
          {money(c, b.perDay)} × {b.days} days = {money(c, b.daily)}
          {b.weekly ? <> · + {money(c, b.weekly)} weekly</> : null}
          {b.end ? <> · + {money(c, b.end)} end bonus</> : null}
        </div>
      )}
      <p>The top bar shows what you&rsquo;ve earned so far; <b>Totals</b> breaks it down week by week.</p>
    </Section>
  )
}

function StreakSection({ c }) {
  const target = c ? Math.min(c.streak.targetDays, c.lengthDays) : null
  return (
    <Section title="Streaks & the prize" open={!!c}>
      <p>
        Your <b>streak</b> is how many complete days you&rsquo;ve done in a row. Miss a day and it goes back to 0 —
        your <b>best streak</b> is remembered.
      </p>
      <p>
        Today never breaks your streak while it&rsquo;s still in progress — you have until midnight.
      </p>
      <p>
        The <b>prize</b> is unlocked by your total number of complete days, not by the streak, so one bad day
        doesn&rsquo;t ruin it.
        {c && (
          <> For this challenge: complete <b>{target} of {c.lengthDays}</b> days to win
            {c.streak.prize ? <> <b>{c.streak.prize}</b></> : ' (no prize named yet — add one in Settings)'}.</>
        )}
      </p>
      <p><b>Progress</b> shows your streaks, days left and whether the prize is still within reach.</p>
    </Section>
  )
}

function RestSection({ c, isMoney }) {
  const r = c ? restCfg(c) : null
  return (
    <Section title="Rest days">
      <p>
        A rest day <b>counts as a full day</b> — you don&rsquo;t need to tick anything.
        {isMoney !== false && <> In money mode it pays the full daily amount and counts as a qualifying day.</>}
        {isMoney !== true && <> In streak mode it counts as a completed day, so your streak keeps going.</>}
        {' '}Resting as planned never costs you anything. It&rsquo;s credited on the day itself, not in advance.
      </p>
      <p>
        You get a set number of rest days for the <b>whole challenge</b> and spend them whenever you like — turn on
        &ldquo;Take a rest day&rdquo; on Today. Once they&rsquo;re used up, they&rsquo;re gone.
        {c && <> This challenge: <b>{r.flexTotal}</b> rest day{r.flexTotal === 1 ? '' : 's'}.</>}
      </p>
      <p>Rest days show with a <Dot cls="off" /> marker and a &ldquo;Rest day&rdquo; tag in Week.</p>
    </Section>
  )
}

function HolidaySection({ c }) {
  const hols = c ? restCfg(c).holidays : []
  const added = c ? holidayDaysAdded(c) : 0
  return (
    <Section title="Holidays">
      <p>
        A holiday <b>pauses the whole challenge</b>. Holiday dates aren&rsquo;t challenge days at all — nothing is
        scored, and the end date moves back by the same number of days.
      </p>
      <p>
        When you&rsquo;re back you carry on exactly where you left off: the same day number, the same week, the same
        weekly targets. You don&rsquo;t lose any days, money or bonuses.
      </p>
      <div className="gli-guide-example">
        Example: a 28-day challenge with a 3-day holiday still has 28 challenge days — it just finishes 3 days later.
      </div>
      {c && hols.length > 0 && (
        <p>
          This challenge: {hols.map((h) => `${h.label || 'Holiday'} (${fmtShort(h.start)}${h.end !== h.start ? `–${fmtShort(h.end)}` : ''})`).join(', ')}
          {added ? <> — adds {added} day{added === 1 ? '' : 's'} to the end.</> : null}
        </p>
      )}
      <p>Add holidays in Settings → Edit. The days around a holiday show a 🌴 &ldquo;paused&rdquo; marker.</p>
    </Section>
  )
}
