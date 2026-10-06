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
//   restDays: { weekdays: [0-6], perWeek, holidays: [{ start, end, label }] },
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
    restDays: { weekdays: [], perWeek: 0, holidays: [] },
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
    restDays: { weekdays: [], perWeek: 1, holidays: [] },
    bodyTracking: false,
  }
}

export const TEMPLATES = [
  { key: 'blank', label: 'Blank challenge', desc: 'Start from scratch with your own habits', make: blankPreset },
  { key: 'gli', label: 'The Great Lock In', desc: 'The 4-week fitness challenge with £ rewards', make: () => ({ ...greatLockInPreset(), startDate: todayISO() }) },
]
