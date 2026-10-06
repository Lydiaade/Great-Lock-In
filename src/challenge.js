// ---------- Challenge structure ----------
export const WEEKS = [
  { num: 1, stair: '15 min', plank: '60 sec', start: '2026-09-07' },
  { num: 2, stair: '20 min', plank: '70 sec', start: '2026-09-14' },
  { num: 3, stair: '25 min', plank: '80 sec', start: '2026-09-21' },
  { num: 4, stair: '30 min', plank: '90 sec', start: '2026-09-28' },
]

export const DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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

export const ALL_DATES = Array.from({ length: 28 }, (_, i) => addDays('2026-09-07', i))

export function weekOfDate(dateStr) {
  return Math.floor(ALL_DATES.indexOf(dateStr) / 7)
}

export const BODY_CHECKPOINTS = [
  { key: 'start', label: 'Start', date: '7 Sept' },
  { key: 'week1', label: 'Week 1 end', date: '13 Sept' },
  { key: 'week2', label: 'Week 2 end', date: '20 Sept' },
  { key: 'week3', label: 'Week 3 end', date: '27 Sept' },
  { key: 'week4', label: 'Week 4 end', date: '4 Oct' },
]

export const DAY_FIELDS_TIER1 = [
  { key: 'cal', label: 'Calories', sub: '2,000 kcal max (2,500 on period days)' },
  { key: 'steps', label: 'Steps', sub: '10,000' },
  { key: 'water', label: 'Water', sub: '2L' },
  { key: 'fast', label: 'Fasting window', sub: 'Eat 10am–6pm (16:8)' },
]

export function tier2Fields(weekIdx) {
  const wk = WEEKS[weekIdx] || WEEKS[0]
  return [
    { key: 'protein', label: 'Protein', sub: '160–200g' },
    { key: 'fibre', label: 'Fibre', sub: '22–30g' },
    { key: 'nojunk', label: 'No junk food', sub: 'Chocolate/popcorn OK on chosen period days' },
    { key: 'plank', label: 'Plank', sub: wk.plank + ' hold' },
  ]
}

export function emptyDay() {
  return {
    logged: false, cal: false, steps: false, water: false, fast: false,
    protein: false, fibre: false, nojunk: false, plank: false,
    liftday: false, stairmaster: false, weighin: false, photo: false, measure: false,
    periodDay: false, notes: '',
  }
}

// ---------- Reward math ----------
// One judgment call: a "qualifying day" = a full £10 day (logging + all Tier 1 + all
// Tier 2). The source tracker doesn't spell this out beyond "full detail in the Reward
// System document" — adjust here if that document defines it differently.
export function dayTotal(d) {
  const t1 = d.cal && d.steps && d.water && d.fast
  const t2 = d.protein && d.fibre && d.nojunk && d.plank
  return (d.logged ? 2 : 0) + (t1 ? 4 : 0) + (t2 ? 4 : 0)
}
export function dayIsFull(d) {
  return dayTotal(d) === 10
}

export function weekStats(weekIdx, getDay) {
  const start = weekIdx * 7
  const dates = ALL_DATES.slice(start, start + 7)
  let loggedAll = true, qualifying = 0, dailySum = 0
  dates.forEach((dt) => {
    const d = getDay(dt)
    if (!d.logged) loggedAll = false
    if (dayIsFull(d)) qualifying++
    dailySum += dayTotal(d)
  })
  // Logging every day that week is the prerequisite for any weekly bonus.
  // Once that's true, £5 is the floor even with zero qualifying days —
  // £20 and £30 are extra tiers on top, not replacements for it.
  let bonus = 0
  if (loggedAll) {
    if (qualifying >= 7) bonus = 30
    else if (qualifying >= 5) bonus = 20
    else bonus = 5
  }
  return { dates, loggedAll, qualifying, dailySum, bonus, subtotal: dailySum + bonus }
}

export function challengeStats(getDay) {
  const weeks = [0, 1, 2, 3].map((i) => weekStats(i, getDay))
  const totalQualifying = weeks.reduce((a, w) => a + w.qualifying, 0)
  const dailyPlusWeekly = weeks.reduce((a, w) => a + w.subtotal, 0)
  const endBonus = totalQualifying >= 26 ? 100 : totalQualifying >= 23 ? 70 : totalQualifying >= 20 ? 40 : 0
  const grand = dailyPlusWeekly + endBonus
  return { weeks, totalQualifying, endBonus, grand }
}
