# The Great Lock In — Tracker (PWA)

A React web app for tracking daily-habit challenges, built so it can be installed on
your phone's home screen like a native app (a "PWA" — Progressive Web App).

Everything about a challenge is configurable from the **Settings** tab:

- **Dates & length** — any start date, any number of days (1–366).
- **Habits** — your own habits in groups (e.g. "Tier 1", "Tier 2"), plus optional
  "extra tracking" items that don't count towards the day. A habit can have weekly
  targets that step up each week (e.g. plank `60 sec, 70 sec, 80 sec`).
- **Reward mode**
  - **Money** — each group earns its amount on days when all its habits are done, plus
    optional weekly and end-of-challenge bonus tiers and your own currency symbol.
  - **Streak & prize** — tracks your current and best streak and unlocks a prize you
    name once you've completed the target number of days.
- **Body tracking** — weekly weigh-in & measurement cards, on or off.
- **Multiple challenges** — keep several, switch between them, duplicate one as the
  starting point for the next. Each keeps its own data.
- **Light / Dark / System** theme.

If you used the first (fixed 4-week) version, your logged data is moved automatically
into a "The Great Lock In" challenge the first time you open this version.

Your data is stored **only on your own device** (in the browser's local storage) — nothing
is sent to a server. That also means: don't clear your browser data/site data for this
app, and if you install it on a new phone you'll start with a blank tracker (there's no
sync between devices in this version).

## Run it locally first (optional, to check it works)

You'll need [Node.js](https://nodejs.org) installed (v18+).

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` link in your browser to try it.

## Deploy it so you can install it on your phone

A PWA can only be "added to home screen" properly once it's served over **https://**
from a real URL — not from a file on your computer. The easiest free ways to get that:

### Option A — Netlify Drop (no account needed, easiest)
1. Run `npm run build` — this creates a `dist` folder.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `dist` folder in.
3. Netlify gives you a `https://...netlify.app` link — open it on your phone.

### Option B — Vercel (free account, more control)
1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Framework preset: **Vite**. Deploy.
4. Open the `https://...vercel.app` link it gives you, on your phone.

### Option C — GitHub Pages
1. Push this folder to a GitHub repo.
2. In `vite.config.js`, add `base: '/your-repo-name/'` inside `defineConfig({...})`.
3. `npm run build`, then deploy the `dist` folder to a `gh-pages` branch
   (e.g. with the `gh-pages` npm package, or GitHub's own Pages-from-Actions flow).

## Add it to your home screen

Once it's live at an https:// URL, open that URL on your phone:

- **iPhone (Safari):** tap the Share icon → "Add to Home Screen".
- **Android (Chrome):** tap the ⋮ menu → "Add to Home Screen" / "Install app".

It'll appear with its own icon and open full-screen, no browser bar — like a normal app.
It also works offline once installed, since it caches itself on first load.

## One thing worth knowing

A "qualifying day" (money mode bonuses) or "complete day" (streak mode) means every
habit group was completed that day. Weekly bonuses only apply to full 7-day weeks. These
rules live in one place: `src/challenge.js`, in `dayIsFull` / `weekStats` / `streakStats`.

## Project structure

```
src/
  challenge.js        - challenge rules, dates, reward & streak math (config-driven)
  presets.js          - challenge config shape + templates (blank, The Great Lock In)
  useChallenges.js    - the saved list of challenges (+ migration from the first version)
  useTrackerData.js   - saves/loads one challenge's days & body data in local storage
  useTheme.js         - light / dark / system theme
  App.jsx             - ties the tabs together
  components/         - Today / Week / Totals / Body / Settings views, challenge editor,
                        hero and nav bar
```
