# Architecture — Emoji Pop

## Stack

- **Framework:** React + Vite (the scaffold default; no deviation)
- **Deploy:** Vercel, connected to `main`
- **Styling:** plain CSS in `src/styles/`, split by concern and imported from
  `index.css`. No CSS framework — the whole app is three components, and a
  utility framework would be more bytes than the app itself.
- **State management:** `useState` inside `EmojiStage`, plus a hand-rolled
  subscribe store in `src/lib/settings.js`. No Zustand, no context.
- **External APIs:** none. No network calls at runtime.
- **Data/persistence:** `localStorage`, for two booleans.
- **Testing:** Vitest for the emoji dataset; Playwright (`scripts/verify-app.mjs`)
  for the interaction behavior unit tests can't reach.

## Data model

There isn't much of one, and that's deliberate.

```
Pop            // one emoji currently on screen, lives ~2.65s then is dropped
  id           number, monotonic
  emoji        string, one grapheme cluster
  x, y         number, viewport coordinates of the touch
  rotation     number, degrees, jitter so stacked taps stay distinct
  size         number, px font-size, also jittered
  bornAt       number, epoch ms — only used by the cleanup sweep

Settings       // persisted to localStorage under "emoji-pop:settings"
  sound        boolean
  haptics      boolean
```

## Key architectural decisions made up front

- **`pointerdown`, not `touchstart` or `click`** — fires once per finger, so
  multi-touch is free, and it covers mouse and pen without a second code path.
  `click` would also lose the sub-100ms feel. — 2026-08-14
- **DOM nodes with CSS keyframes, not canvas** — at 40 concurrent elements
  animating only `transform` and `opacity`, the compositor handles it without
  the main thread, and the code stays readable. Canvas would only pay off an
  order of magnitude higher. — 2026-08-14
- **Synthesized audio, not sample files** — no asset to download, no decode
  latency on the first tap, and per-pop pitch variation comes free. — 2026-08-14
- **Settings as a module-level store, not React context** — audio and haptics
  read the setting on every single tap, from outside the component tree.
  Threading props for two rarely-changed booleans would add re-renders on the
  hot path for nothing. — 2026-08-14

## Known constraints / things to watch

- **iOS audio unlock.** The `AudioContext` starts suspended and only resumes
  from inside a real user gesture, so `unlockAudio()` is called on every
  `pointerdown`. It also stays subject to the hardware silent switch — muting
  the iPad mutes the pops, and there is no web API to override that.
- **No haptics on iOS.** `navigator.vibrate` is unimplemented in Safari. The
  wrapper is a no-op there and the settings toggle disables itself.
- **Emoji rendering is the device's, not ours.** The curated set is restricted
  to single grapheme clusters at Unicode ≤ 12.0 precisely because ZWJ sequences
  and newer emoji degrade badly on tablets that haven't been updated. Any
  addition to `src/data/emoji.js` has to hold that line — the Vitest suite
  enforces it.
- **`animationend` is not guaranteed.** Backgrounded tabs throttle animations
  and iOS fires nothing while suspended, so `EmojiStage` runs a 1s interval
  sweep to drop anything past its lifetime. Without it, coming back to a
  backgrounded app would show a screen frozen full of emoji.
- **The 40-node cap is a real ceiling, not a guess.** A toddler can sustain a
  tap rate above the removal rate; the cap is what keeps that from degrading
  into a slideshow.

## Folder structure

Standard Vite React layout, plus:

```
src/
  components/   EmojiStage, SettingsPanel
  data/         emoji.js + emoji.test.js
  lib/          audio.js, haptics.js, settings.js
  styles/       index.css (entry) + emoji.css + settings.css
scripts/
  new-feature.sh    worktree + branch per feature (from the scaffold)
  run-tickets.sh    headless ticket runner
  verify-app.mjs    Playwright end-to-end checks
docs/
  PRD.md ARCHITECTURE.md DECISIONS.md TICKETS.md
```
