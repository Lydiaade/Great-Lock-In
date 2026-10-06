# The Great Lock In — Tracker (PWA)

A React web app version of your 4-week challenge tracker, built so it can be installed
on your phone's home screen like a native app (a "PWA" — Progressive Web App).

It has the same four tabs as the version I built earlier (Today / Week / Totals / Body),
same reward math, same look — just installable and running as its own app icon instead
of living inside a chat.

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

A "qualifying day" (used for weekly and end-of-challenge bonuses) is treated here as a
full £10 day — logging plus all of Tier 1 plus all of Tier 2. Your tracker sheet points to
a separate "Reward System document" for the full detail, which I don't have — if that
document defines qualifying days differently, the rule lives in one place:
`src/challenge.js`, in the `dayIsFull` / `weekStats` functions.

## Project structure

```
src/
  challenge.js        - all the challenge rules, dates, and reward math in one place
  useTrackerData.js    - saves/loads your data from the browser's local storage
  App.jsx              - ties the tabs together
  components/          - Today / Week / Totals / Body views, plus the hero and nav bar
```
