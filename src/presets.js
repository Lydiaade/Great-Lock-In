import { todayISO } from './challenge'

// Challenge config shape:
// {
//   id, name, startDate: 'YYYY-MM-DD', lengthDays,
//   rewardMode: 'money' | 'streak', currency,
//   groups: [{ id, name, value, habits: [{ id, label, sub, weekly: [] }] }],  // counted
//   extras: [{ id, label, sub, weekly: [] }],                                  // tracked only
//   weeklyBonus: { enabled, gateGroupId, tiers: [{ minDays, amount }] },
//   endBonus: { enabled, tiers: [{ minDays, amount }] },
//   streak: { targetDays, prize },
//   restDays: { flexTotal, holidays: [{ start, end, label }] },
//   bodyTracking,
// }
// A habit's `sub` may contain {target}, replaced with that week's entry from `weekly`.

export function newId(prefix) {
  return prefix + '-' + Math.random().toString(36).slice(2, 9)
}

// The original 4-week challenge. Habit ids match the keys used by the first version
// of the app, so previously saved days carry straight over.
export function greatLockInPreset() {
  return {
    name: 'The Great Lock In',
    startDate: '2026-09-07',
    lengthDays: 28,
    rewardMode: 'money',
    currency: '£',
    groups: [
      { id: 'g-log', name: 'Logging', value: 2, habits: [
        { id: 'logged', label: 'Food logged', sub: '' },
      ] },
      { id: 'g-t1', name: 'Tier 1', value: 4, habits: [
        { id: 'cal', label: 'Calories', sub: '2,000 kcal max (2,500 on period days)' },
        { id: 'steps', label: 'Steps', sub: '10,000' },
        { id: 'water', label: 'Water', sub: '2L' },
        { id: 'fast', label: 'Fasting window', sub: 'Eat 10am–6pm (16:8)' },
      ] },
      { id: 'g-t2', name: 'Tier 2', value: 4, habits: [
        { id: 'protein', label: 'Protein', sub: '160–200g' },
        { id: 'fibre', label: 'Fibre', sub: '22–30g' },
        { id: 'nojunk', label: 'No junk food', sub: 'Chocolate/popcorn OK on chosen period days' },
        { id: 'plank', label: 'Plank', sub: '{target} hold', weekly: ['60 sec', '70 sec', '80 sec', '90 sec'] },
      ] },
    ],
    extras: [
      { id: 'liftday', label: 'Lift day', sub: 'Lifting + stairmaster session' },
      { id: 'stairmaster', label: 'Stairmaster', sub: '', weekly: ['15 min', '20 min', '25 min', '30 min'] },
      { id: 'weighin', label: 'Weigh-in logged', sub: '' },
      { id: 'photo', label: 'Progress photo', sub: '' },
      { id: 'measure', label: 'Measurements taken', sub: '' },
      { id: 'periodDay', label: 'Period day (extra allowance)', sub: 'Choose up to 2 days: 2,500 kcal ceiling, chocolate/popcorn OK' },
    ],
    weeklyBonus: { enabled: true, gateGroupId: 'g-log', tiers: [
      { minDays: 7, amount: 30 }, { minDays: 5, amount: 20 }, { minDays: 0, amount: 5 },
    ] },
    endBonus: { enabled: true, tiers: [
      { minDays: 26, amount: 100 }, { minDays: 23, amount: 70 }, { minDays: 20, amount: 40 },
    ] },
    streak: { targetDays: 24, prize: '' },
    restDays: { flexTotal: 0, holidays: [] },
    bodyTracking: true,
  }
}

export function blankPreset() {
  return {
    name: 'New challenge',
    startDate: todayISO(),
    lengthDays: 30,
    rewardMode: 'streak',
    currency: '£',
    groups: [
      { id: newId('g'), name: 'Daily habits', value: 5, habits: [
        { id: newId('h'), label: 'Habit one', sub: '' },
      ] },
    ],
    extras: [],
    weeklyBonus: { enabled: false, gateGroupId: '', tiers: [{ minDays: 7, amount: 10 }] },
    endBonus: { enabled: false, tiers: [{ minDays: 25, amount: 50 }] },
    streak: { targetDays: 25, prize: '' },
    restDays: { flexTotal: 4, holidays: [] },
    bodyTracking: false,
  }
}

// ---------- 75-day challenges ----------
// 75 Hard follows the official rules: every task, every day, no rest days — a single
// miss means starting again (here: the prize needs all 75 days). 75 Medium and 75 Soft
// are popular community variations; there's no official version, so these use the most
// common rules. All are fully editable after picking.
function seventyFive({ name, habits, restDays, bodyTracking = false }) {
  return {
    name,
    startDate: todayISO(),
    lengthDays: 75,
    rewardMode: 'streak',
    currency: '£',
    groups: [
      { id: newId('g'), name: 'Daily tasks', value: 5, habits: habits.map(([label, sub]) => ({ id: newId('h'), label, sub })) },
    ],
    extras: [],
    weeklyBonus: { enabled: false, gateGroupId: '', tiers: [{ minDays: 7, amount: 10 }] },
    endBonus: { enabled: false, tiers: [{ minDays: 75, amount: 100 }] },
    streak: { targetDays: 75, prize: '' },
    restDays: { flexTotal: restDays, holidays: [] },
    bodyTracking,
  }
}

export function seventyFiveHardPreset() {
  return seventyFive({
    name: '75 Hard',
    restDays: 0,
    bodyTracking: true,
    habits: [
      ['Follow a diet', 'Your chosen plan — no cheat meals, no alcohol'],
      ['Workout 1', '45 minutes'],
      ['Workout 2 — outdoors', '45 minutes, must be outside'],
      ['Drink 1 gallon of water', '3.8 litres'],
      ['Read 10 pages', 'Non-fiction / self-development book'],
      ['Progress photo', 'Take one every day'],
    ],
  })
}

export function seventyFiveMediumPreset() {
  return seventyFive({
    name: '75 Medium',
    restDays: 10,
    habits: [
      ['Follow a healthy diet', 'No cheat meals — alcohol only on social occasions'],
      ['Workout', '45 minutes'],
      ['Drink 3 litres of water', ''],
      ['Read 10 pages', 'Non-fiction / self-development book'],
      ['Mindfulness', '10 minutes — meditate, journal or breathwork'],
    ],
  })
}

export const TEMPLATES = [
  { key: 'blank', label: 'Blank challenge', desc: 'Start from scratch with your own habits', make: blankPreset },
  { key: 'gli', label: 'The Great Lock In', desc: 'The 4-week fitness challenge with £ rewards', make: () => ({ ...greatLockInPreset(), startDate: todayISO() }) },
  { key: '75hard', label: '75 Hard', desc: '75 days · 6 daily tasks incl. two workouts · no rest days, miss one and you start again', make: seventyFiveHardPreset },
  { key: '75medium', label: '75 Medium', desc: '75 days · 5 daily tasks incl. mindfulness · 10 rest days', make: seventyFiveMediumPreset },
]
