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

export function challengeDates(c) {
  return Array.from({ length: c.lengthDays }, (_, i) => addDays(c.startDate, i))
}
export function endDate(c) {
  return addDays(c.startDate, c.lengthDays - 1)
}
export function fmtRange(c) {
  const end = endDate(c)
  return `${fmtShort(c.startDate)} – ${fmtShort(end)} ${toDate(end).getFullYear()}`
}
export function weekCount(c) {
  return Math.ceil(c.lengthDays / 7)
}
// Index of a date within the challenge (may be negative or >= length when outside it).
export function dayIndex(c, dateStr) {
  return daysBetween(c.startDate, dateStr)
}
// Today's index clamped into the challenge, for default navigation.
export function defaultDayIdx(c) {
  return Math.min(Math.max(dayIndex(c, todayISO()), 0), c.lengthDays - 1)
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
// A day is "off" when it falls in a holiday, on a fixed weekly rest weekday, or the
// user marked it as a flexible rest day (day field `_rest`, limited to perWeek per
// challenge week). Off days never break a streak and don't fail weekly bonus rules.
export const REST_FIELD = '_rest'

export function restCfg(c) {
  const r = c.restDays || {}
  return { weekdays: r.weekdays || [], perWeek: Number(r.perWeek) || 0, holidays: r.holidays || [] }
}

export function holidayOn(c, dateStr) {
  return restCfg(c).holidays.find((h) => dateStr >= h.start && dateStr <= (h.end || h.start)) || null
}

// Planned off days (holiday / fixed weekday) — known in advance, no day data needed.
export function plannedOff(c, dateStr) {
  const h = holidayOn(c, dateStr)
  if (h) return { kind: 'holiday', label: h.label || 'Holiday' }
  if (restCfg(c).weekdays.includes(toDate(dateStr).getDay())) return { kind: 'rest', label: 'Rest day' }
  return null
}

// Off status for every date in one challenge week. Flexible rest days only count up to
// perWeek (earliest first), so lowering the allowance later can't over-credit.
export function weekOffMap(c, weekIdx, getDay) {
  const { perWeek } = restCfg(c)
  const map = new Map()
  let flexUsed = 0
  challengeDates(c).slice(weekIdx * 7, weekIdx * 7 + 7).forEach((dt) => {
    const planned = plannedOff(c, dt)
    if (planned) map.set(dt, planned)
    else if (getDay(dt)[REST_FIELD] && flexUsed < perWeek) {
      flexUsed++
      map.set(dt, { kind: 'rest', label: 'Rest day', flexible: true })
    }
  })
  return { map, flexUsed, flexLeft: Math.max(0, perWeek - flexUsed) }
}

export function offMap(c, getDay) {
  const map = new Map()
  for (let w = 0; w < weekCount(c); w++) weekOffMap(c, w, getDay).map.forEach((v, k) => map.set(k, v))
  return map
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
  const { map: off } = weekOffMap(c, weekIdx, getDay)
  let gateAll = true, qualifying = 0, dailySum = 0, offDays = 0
  dates.forEach((dt) => {
    const d = getDay(dt)
    const isOff = off.has(dt)
    if (isOff) offDays++
    // Off days pass the gate and count as qualifying, but only earn daily money if done.
    if (gate && !isOff && !groupDone(gate, d)) gateAll = false
    if (isOff || dayIsFull(c, d)) qualifying++
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

export function maxReward(c) {
  const fullWeeks = Math.floor(c.lengthDays / 7)
  const maxTier = (tiers) => Math.max(0, ...(tiers || []).map((t) => t.amount))
  return c.lengthDays * maxPerDay(c)
    + (c.weeklyBonus.enabled ? fullWeeks * maxTier(c.weeklyBonus.tiers) : 0)
    + (c.endBonus.enabled ? maxTier(c.endBonus.tiers) : 0)
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
  const full = dates.map((dt) => dayIsFull(c, getDay(dt)))
  const offs = offMap(c, getDay)
  const off = dates.map((dt) => offs.has(dt))

  // Off days are neutral: they don't add to the streak (unless done anyway) or break it.
  let completed = 0, best = 0, run = 0
  for (let i = 0; i <= lastIdx; i++) {
    if (full[i]) { completed++; run++; best = Math.max(best, run) } else if (!off[i]) run = 0
  }

  // Today still in progress doesn't break the streak — count back from yesterday.
  let i = lastIdx
  if (i === todayIdx && i >= 0 && !full[i]) i--
  let current = 0
  while (i >= 0 && (full[i] || off[i])) { if (full[i]) current++; i-- }

  // Planned off days (holidays, fixed rest weekdays) reduce the days available to win.
  const plannedOffCount = dates.filter((dt) => plannedOff(c, dt)).length
  const activeDays = Math.max(1, dates.length - plannedOffCount)
  const target = Math.min(Number(c.streak.targetDays) || activeDays, activeDays)

  // Days that can still be completed (today counts if not yet done; off days don't).
  const from = Math.max(0, todayIdx)
  let daysLeft = 0
  for (let j = from; j < dates.length; j++) {
    if (full[j] || off[j]) continue
    daysLeft++
  }

  return {
    completed, best, current, target, daysLeft, activeDays,
    offTaken: off.slice(0, lastIdx + 1).filter(Boolean).length,
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
