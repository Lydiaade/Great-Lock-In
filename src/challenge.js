// All challenge rules are driven by a config object (see presets.js for the shape).

export const DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ---------- Dates ----------
export function toDate(str) {
  const p = str.split('-')
  return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]))
}
export function fmtISO(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}
export function addDays(str, n) {
  const d = toDate(str)
  d.setDate(d.getDate() + n)
  return fmtISO(d)
}
export function daysBetween(a, b) {
  return Math.round((toDate(b) - toDate(a)) / 86400000)
}
export function fmtShort(str) {
  const d = toDate(str)
  return d.getDate() + ' ' + MONTHS[d.getMonth()]
}
export function todayISO() {
  return fmtISO(new Date())
}

// ---------- Timeline ----------
// The challenge is `lengthDays` challenge days long. Holidays pause it: holiday dates
// are skipped and the end date moves back, so every challenge day still happens.
const datesCache = new WeakMap()
export function challengeDates(c) {
  if (datesCache.has(c)) return datesCache.get(c)
  const dates = []
  let dt = c.startDate
  // Guard against runaway holiday ranges.
  for (let guard = 0; dates.length < c.lengthDays && guard < c.lengthDays + 3700; guard++) {
    if (!holidayOn(c, dt)) dates.push(dt)
    dt = addDays(dt, 1)
  }
  datesCache.set(c, dates)
  return dates
}
export function endDate(c) {
  const dates = challengeDates(c)
  return dates[dates.length - 1] || c.startDate
}
// Calendar days added to the challenge by holidays.
export function holidayDaysAdded(c) {
  return daysBetween(c.startDate, endDate(c)) + 1 - challengeDates(c).length
}
export function fmtRange(c) {
  const end = endDate(c)
  return `${fmtShort(c.startDate)} – ${fmtShort(end)} ${toDate(end).getFullYear()}`
}
export function weekCount(c) {
  return Math.ceil(c.lengthDays / 7)
}
// Challenge-day index of a date: negative before the start, >= length after the end.
// A holiday date maps to the next challenge day (the one the challenge resumes on).
export function dayIndex(c, dateStr) {
  const dates = challengeDates(c)
  if (dateStr < c.startDate) return daysBetween(c.startDate, dateStr)
  const end = dates[dates.length - 1]
  if (dateStr > end) return dates.length - 1 + daysBetween(end, dateStr)
  const i = dates.findIndex((d) => d >= dateStr)
  return i
}
// Today's index clamped into the challenge, for default navigation.
export function defaultDayIdx(c) {
  return Math.min(Math.max(dayIndex(c, todayISO()), 0), c.lengthDays - 1)
}
// The holiday today falls in, if it pauses the challenge right now.
export function pausedToday(c) {
  const t = todayISO()
  return t >= c.startDate && t <= endDate(c) ? holidayOn(c, t) : null
}
// The holiday (if any) the challenge paused for just before challenge day `idx`.
export function holidayBefore(c, idx) {
  const dates = challengeDates(c)
  if (idx <= 0 || daysBetween(dates[idx - 1], dates[idx]) <= 1) return null
  const from = addDays(dates[idx - 1], 1), to = addDays(dates[idx], -1)
  return { ...holidayOn(c, from), from, to }
}

// ---------- Habits ----------
export function weekTarget(habit, weekIdx) {
  const t = (habit.weekly || []).filter(Boolean)
  return t.length ? t[Math.min(weekIdx, t.length - 1)] : null
}
export function habitSub(habit, weekIdx) {
  const target = weekTarget(habit, weekIdx)
  const sub = habit.sub || ''
  if (!target) return sub.replace('{target}', '').trim()
  if (sub.includes('{target}')) return sub.replace('{target}', target)
  return sub ? `${sub} · ${target}` : target
}
export function allHabits(c) {
  return [...c.groups.flatMap((g) => g.habits), ...c.extras]
}
export function countedHabits(c) {
  return c.groups.flatMap((g) => g.habits)
}

// ---------- Rest days & holidays ----------
// Holidays aren't challenge days at all (see challengeDates). A challenge day is a rest
// day when the user marked it as one (day field `_rest`), limited to `flexTotal` across
// the whole challenge. Rest is paid: a rest day is
// scored as if every habit was done (effectiveDay) — full daily amount, qualifying, and
// it keeps the streak going. Resting as planned never costs anything.
export const REST_FIELD = '_rest'

export function restCfg(c) {
  const r = c.restDays || {}
  // Older configs stored a per-week allowance; convert it to a challenge-wide total.
  const flexTotal = r.flexTotal != null ? Number(r.flexTotal) || 0 : (Number(r.perWeek) || 0) * weekCount(c)
  return { flexTotal, holidays: r.holidays || [] }
}

export function holidayOn(c, dateStr) {
  return restCfg(c).holidays.find((h) => dateStr >= h.start && dateStr <= (h.end || h.start)) || null
}

// Rest status for every challenge date. Rest days only count up to the challenge-wide
// allowance (earliest first), so lowering it later can't over-credit.
export function restInfo(c, getDay) {
  const { flexTotal } = restCfg(c)
  const map = new Map()
  let flexUsed = 0
  challengeDates(c).forEach((dt) => {
    if (getDay(dt)[REST_FIELD] && flexUsed < flexTotal) {
      flexUsed++
      map.set(dt, { kind: 'rest', label: 'Rest day' })
    }
  })
  return { map, flexTotal, flexUsed, flexLeft: Math.max(0, flexTotal - flexUsed) }
}

// The day's data as scored: a rest day counts as every habit done — but only once its
// date has arrived, so upcoming rest days aren't paid out in advance.
export function restCredited(isRest, dateStr) {
  return !!isRest && dateStr <= todayISO()
}
export function effectiveDay(c, d, isRest, dateStr) {
  if (!restCredited(isRest, dateStr)) return d
  const e = { ...d }
  countedHabits(c).forEach((h) => { e[h.id] = true })
  return e
}

// ---------- Scoring ----------
export function groupDone(g, d) {
  return g.habits.length > 0 && g.habits.every((h) => d[h.id])
}
export function dayTotal(c, d) {
  return c.groups.reduce((a, g) => a + (groupDone(g, d) ? Number(g.value) || 0 : 0), 0)
}
export function maxPerDay(c) {
  return c.groups.reduce((a, g) => a + (Number(g.value) || 0), 0)
}
// A "qualifying" / complete day = every counted group finished.
export function dayIsFull(c, d) {
  const groups = c.groups.filter((g) => g.habits.length)
  return groups.length > 0 && groups.every((g) => groupDone(g, d))
}
export function habitsDone(c, d) {
  const hs = countedHabits(c)
  return { done: hs.filter((h) => d[h.id]).length, total: hs.length }
}

function sortedTiers(tiers) {
  return [...(tiers || [])].sort((a, b) => b.minDays - a.minDays)
}
function tierAmount(tiers, n) {
  const t = sortedTiers(tiers).find((t) => n >= t.minDays)
  return t ? t.amount : 0
}

export function weekStats(c, weekIdx, getDay) {
  const dates = challengeDates(c).slice(weekIdx * 7, weekIdx * 7 + 7)
  const wb = c.weeklyBonus
  const gate = wb.gateGroupId ? c.groups.find((g) => g.id === wb.gateGroupId) : null
  const { map: off } = restInfo(c, getDay)
  let gateAll = true, qualifying = 0, dailySum = 0, offDays = 0
  dates.forEach((dt) => {
    const isOff = off.has(dt)
    if (isOff) offDays++
    const d = effectiveDay(c, getDay(dt), isOff, dt)
    if (gate && !groupDone(gate, d)) gateAll = false
    if (dayIsFull(c, d)) qualifying++
    dailySum += dayTotal(c, d)
  })
  // Weekly bonus only applies to complete 7-day weeks, and only once the gate group
  // (e.g. "food logged") was done every day that week.
  const isFullWeek = dates.length === 7
  const bonus = wb.enabled && isFullWeek && gateAll ? tierAmount(wb.tiers, qualifying) : 0
  return { dates, gate, gateAll, isFullWeek, qualifying, offDays, dailySum, bonus, subtotal: dailySum + bonus }
}

export function challengeStats(c, getDay) {
  const weeks = Array.from({ length: weekCount(c) }, (_, i) => weekStats(c, i, getDay))
  const totalQualifying = weeks.reduce((a, w) => a + w.qualifying, 0)
  const dailyPlusWeekly = weeks.reduce((a, w) => a + w.subtotal, 0)
  const endBonus = c.endBonus.enabled ? tierAmount(c.endBonus.tiers, totalQualifying) : 0
  return { weeks, totalQualifying, endBonus, grand: dailyPlusWeekly + endBonus, max: maxReward(c) }
}

// The most that can be won: every day qualifying, top weekly and end tiers. Rest days
// don't reduce it — they pay in full.
export function maxRewardBreakdown(c) {
  const fullWeeks = Math.floor(c.lengthDays / 7)
  const maxTier = (tiers) => Math.max(0, ...(tiers || []).map((t) => t.amount))
  const perDay = maxPerDay(c)
  const weeklyTop = c.weeklyBonus.enabled ? maxTier(c.weeklyBonus.tiers) : 0
  const daily = c.lengthDays * perDay
  const weekly = fullWeeks * weeklyTop
  const end = c.endBonus.enabled ? maxTier(c.endBonus.tiers) : 0
  return { perDay, days: c.lengthDays, daily, weeklyTop, fullWeeks, weekly, end, total: daily + weekly + end }
}
export function maxReward(c) {
  return maxRewardBreakdown(c).total
}

// End-bonus tiers as display rows, highest first, with day ranges.
export function endBonusRows(c) {
  const tiers = sortedTiers(c.endBonus.tiers)
  const rows = tiers.map((t, i) => {
    const upper = i === 0 ? c.lengthDays : tiers[i - 1].minDays - 1
    return { min: t.minDays, label: upper > t.minDays ? `${t.minDays}–${upper} days` : `${t.minDays} days`, amount: t.amount }
  })
  const lowest = tiers.length ? tiers[tiers.length - 1].minDays : 0
  if (lowest > 0) rows.push({ min: 0, label: `Under ${lowest} days`, amount: 0 })
  return rows
}

// ---------- Streaks ----------
export function streakStats(c, getDay) {
  const dates = challengeDates(c)
  const todayIdx = dayIndex(c, todayISO())
  const lastIdx = Math.min(todayIdx, dates.length - 1)
  const offs = restInfo(c, getDay).map
  // Rest days are scored as full days (see effectiveDay).
  const full = dates.map((dt) => dayIsFull(c, effectiveDay(c, getDay(dt), offs.has(dt), dt)))

  let completed = 0, best = 0, run = 0
  for (let i = 0; i <= lastIdx; i++) {
    if (full[i]) { completed++; run++; best = Math.max(best, run) } else run = 0
  }

  // Today still in progress doesn't break the streak — count back from yesterday.
  let i = lastIdx
  if (i === todayIdx && i >= 0 && !full[i]) i--
  let current = 0
  while (i >= 0 && full[i]) { current++; i-- }

  const target = Math.min(Number(c.streak.targetDays) || dates.length, dates.length)

  // Days that can still be completed: today if not yet done, and every future day.
  let daysLeft = 0
  for (let j = Math.max(0, todayIdx); j < dates.length; j++) {
    if (!(j <= lastIdx && full[j])) daysLeft++
  }

  return {
    completed, best, current, target, daysLeft,
    activeDays: dates.length,
    offTaken: dates.slice(0, lastIdx + 1).filter((dt) => offs.has(dt)).length,
    unlocked: completed >= target,
    stillPossible: completed + daysLeft >= target,
  }
}

// ---------- Body ----------
export function bodyCheckpoints(c) {
  const dates = challengeDates(c)
  return [
    { key: 'start', label: 'Start', date: fmtShort(c.startDate) },
    ...Array.from({ length: weekCount(c) }, (_, w) => ({
      key: `week${w + 1}`,
      label: `Week ${w + 1} end`,
      date: fmtShort(dates[Math.min(w * 7 + 6, dates.length - 1)]),
    })),
  ]
}

// ---------- Formatting ----------
export function money(c, n) {
  return (c.currency || '') + n
}

// ---------- Completion ----------
// Complete once the end date has passed, or on the last day as soon as it's done.
export function isChallengeComplete(c, getDay) {
  const end = endDate(c), t = todayISO()
  if (t !== end) return t > end
  return dayIsFull(c, effectiveDay(c, getDay(end), restInfo(c, getDay).map.has(end), end))
}

// Headline results, used by the celebration and the before & after image.
export function challengeSummary(c, getDay) {
  if (c.rewardMode === 'money') {
    const s = challengeStats(c, getDay)
    return {
      headline: `${money(c, s.grand)} earned`,
      lines: [`${money(c, s.grand)} of ${money(c, s.max)} possible`, `${s.totalQualifying} of ${c.lengthDays} qualifying days`],
      short: `${money(c, s.grand)} earned · ${s.totalQualifying}/${c.lengthDays} qualifying days`,
      prizeWon: null,
    }
  }
  const s = streakStats(c, getDay)
  return {
    headline: `${s.completed} of ${c.lengthDays} days complete`,
    lines: [`${s.completed} of ${c.lengthDays} days complete`, `Best streak: ${s.best} day${s.best === 1 ? '' : 's'}`],
    short: `${s.completed}/${c.lengthDays} days complete · best streak ${s.best}`,
    prizeWon: s.unlocked ? (c.streak.prize || 'Prize unlocked') : null,
    prizeMissed: !s.unlocked && c.streak.prize ? c.streak.prize : null,
  }
}
