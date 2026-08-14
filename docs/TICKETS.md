# Tickets — Emoji Pop

Work queue for `scripts/run-tickets.sh`. The runner reads the checklist below,
finds the first unchecked ticket, feeds that ticket's section to Claude Code,
gates the result on build + tests, and ticks the box only when it's green.

**Format rules the runner depends on — don't break these:**

- Checklist entries look exactly like `- [ ] T-NN — Title`
- Each ticket has a matching `## T-NN — Title` section below
- A ticked box (`- [x]`) is skipped

---

## Queue

- [x] T-01 — Scaffold the Vite app and instantiate the docs
- [x] T-02 — Curated emoji dataset
- [x] T-03 — Tap-to-pop core loop
- [x] T-04 — Toddler lock-down and PWA install
- [x] T-05 — Pop sound
- [x] T-06 — Haptics
- [x] T-07 — Parent gesture and settings panel
- [x] T-08 — Polish and deploy readiness
- [x] T-09 — Light theme, onboarding hint, tap counter

---

## T-01 — Scaffold the Vite app and instantiate the docs

**Scope.** Stand up a React + Vite app in the repo root without disturbing the
scaffold files already there. Add `.gitignore` covering `node_modules`, `dist`,
`.env.local`, and `.DS_Store`. Add Vitest. Instantiate `docs/PRD.md`,
`docs/ARCHITECTURE.md`, and `docs/DECISIONS.md` from their templates and fill
them in for this project. Fill the `<fill in>` name and one-liner in `CLAUDE.md`.

**Done when.** `npm run build` succeeds and the dev server serves the app shell.

---

## T-02 — Curated emoji dataset

**Scope.** `src/data/emoji.js` exporting a curated kid-safe pool of at least 250
emoji grouped by category (animals, food, vehicles, nature, faces, toys,
hearts). Every entry must be a single grapheme cluster — no ZWJ sequences, no
skin-tone modifiers, no regional-indicator flags — and nothing newer than
Unicode 12.0, so nothing renders as a tofu box on an older iPad. Exclude
weapons, alcohol, drugs, smoking, medical, religious symbols, and hand gestures.
Export `pickRandomEmoji(previous)` that never returns the same emoji twice in a
row and stays uniform across the rest of the pool.

**Done when.** A Vitest suite asserts: no duplicates, every entry is one
grapheme cluster, no ZWJ/skin-tone/flag codepoints, no banned emoji, and no
immediate repeat across 1000 consecutive draws.

---

## T-03 — Tap-to-pop core loop

**Scope.** An `EmojiStage` component owning the list of on-screen emoji. Each
`pointerdown` spawns one emoji at the exact touch point with random rotation and
size jitter so repeated taps in one spot stay distinct. Use `pointerdown` rather
than `touchstart` so every finger fires its own event and mouse/pen work for
free. Emoji nodes are `pointer-events: none`. Animate pop-in (~250ms, slight
overshoot), hold (~1.6s), then fade and drift upward (~800ms), using only
`transform` and `opacity`. Remove each node on `animationend`, with an interval
sweep as a fallback for when that event never fires. Cap concurrent nodes at 40,
evicting oldest first.

**Done when.** Five simultaneous pointers produce five independent emoji, a
60-tap burst never exceeds the cap, and the stage drains back to zero nodes.

---

## T-04 — Toddler lock-down and PWA install

**Scope.** Viewport meta with `user-scalable=no` and `viewport-fit=cover`. CSS
to kill text selection, the iOS long-press callout, tap highlight, overscroll
and rubber-banding, and all touch-action gestures. JS `preventDefault` on
`gesturestart`/`gesturechange`/`gestureend`, `contextmenu`, and `dblclick`.
Safe-area insets on the stage. `public/manifest.webmanifest` with
`display: standalone` plus theme and background colors, the Apple-specific meta
tags, and a 180×180 `apple-touch-icon.png`.

**Done when.** Launched from the iPad home screen there is no browser chrome;
pinch and double-tap don't zoom; pull-down doesn't refresh; long-press shows no
callout.

---

## T-05 — Pop sound

**Scope.** `src/lib/audio.js` with a lazily created `AudioContext`, unlocked and
resumed from inside a real pointer gesture (iOS starts it suspended). Each pop
is one synthesized voice — a triangle oscillator with a short upward pitch glide
and a fast gain envelope — at a random pitch drawn from a C major pentatonic
scale, so simultaneous taps harmonize instead of clashing. Cap concurrent voices
at 8 and drop rather than queue past that. Honor the sound setting.

**Done when.** The first tap makes a sound on iOS, rapid tapping doesn't
crackle, and muting silences it.

---

## T-06 — Haptics

**Scope.** `src/lib/haptics.js` wrapping `navigator.vibrate(12)`, guarded for
browsers that don't implement it (iOS Safari doesn't), honoring the haptics
setting, and exporting a support check the settings UI can use to disable the
toggle.

**Done when.** No error on iOS Safari; buzzes on Android.

---

## T-07 — Parent gesture and settings panel

**Scope.** A 2.5-second continuous hold inside a 64px top-left corner zone opens
a settings panel, cancelled if the pointer lifts or moves more than 20px. A
normal tap in that corner must still pop an emoji like anywhere else. The panel
carries sound and haptics toggles persisted to `localStorage` through a small
store in `src/lib/settings.js` (best-effort — Safari private browsing throws on
localStorage). Panel meets the accessibility bar: 44px-plus targets, visible
focus, Esc to close, focus trapped while open, focus restored on close.

**Done when.** Ordinary corner tapping never opens it, a deliberate hold always
does, and settings survive a reload.

---

## T-08 — Polish and deploy readiness

**Scope.** Night-sky gradient background. Space/Enter spawns an emoji at a
random position for keyboard users. `prefers-reduced-motion` keeps the fade but
drops the bounce and drift. Zero console errors or warnings. Rewrite `README.md`
for this project — it still describes the vibe-scaffold template. Record the
judgment calls in `docs/DECISIONS.md`.

**Done when.** `npm run build` is clean, `npm run preview` verified, and
`node scripts/verify-app.mjs` passes every check.

---

## T-09 — Light theme, onboarding hint, tap counter

**Scope.** Replace the dark purple palette with a light theme across
`index.html` (`theme-color`), `public/manifest.webmanifest`
(`background_color`/`theme_color`), and `src/styles/index.css`
(`color-scheme`, `--bg-*`/`--text-*` custom properties), so Safari's status
bar and URL-bar chrome render consistently light instead of showing purple.
Add an `OnboardingHint` component showing "Tap anywhere to make an emoji" on
load, fading permanently after the third tap. Add a display-only `TapCounter`
chip, top-right, backed by shared tap-count state in `App.jsx`. Add a "Reset
tap counter" button inside `SettingsPanel`, gated behind the existing 2.5s
corner-hold parent gesture — the counter is not resettable from anywhere a
child could reach.

**Done when.** `npm run build` is clean, `node scripts/verify-app.mjs` passes
every check, the background reads as a consistent light color with no purple
in the simulated safe-area/status-bar region, the hint fades after 3 taps and
stays gone even after a Settings-panel reset, and the counter only resets via
the parent gesture.
