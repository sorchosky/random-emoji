# Decisions Log — Emoji Pop

> Append-only. Claude Code adds an entry any time it makes a judgment call the
> PRD didn't specify, or you make a call together mid-build. Newest at top.
> This is what keeps a second session (or a second project) from re-deciding
> something already settled.

---

### 2026-08-15 — HUD redesign: no chip containers, cool near-white palette

**Context:** Owner-requested redesign. The tap counter and onboarding hint each
drew their own `--panel` card, and were coupled by a magic number
(`hud.css:7` reserved exactly `76px` for the counter chip so the hint's
centered text couldn't run under it). The owner also wanted the counter moved
to the top-left, the two elements baseline-aligned as a pair, and the warm
cream palette (`#fbeed9` background, brown text, orange accent) replaced with
a cool near-white one.

**Decision:** Both chips lost their background/border/padding — they now sit
directly on the page as plain text, in one flex row (`.hud`) with
`align-items: baseline`, which is what makes the differently-sized counter and
hint read as a pair without a container. The palette tokens in
`index.css` moved to cool neutrals (`--bg: #f2f5f9`, `--panel: #ffffff`,
`--text: #1e2732`, `--text-dim: #64748b`); `--accent` (`#ff9d42`) and `--focus`
were kept unchanged; the accent is now the one warm signal in an otherwise
cool UI.

`--bg` is duplicated in `index.html`'s `theme-color` and in
`public/manifest.webmanifest`'s `background_color`/`theme_color` — see the
2026-08-14 flat-background entry below for why. All three were updated
together to keep iOS Safari's chrome tint matching the page.

**Reversible?** Yes — CSS tokens and one rewritten stylesheet.

---

### 2026-08-15 — Visible menu button added; corner hold mirrored to top-right

**Context:** The owner asked for a visible menu button (top-right) that opens
Settings, alongside the existing hidden 2.5s corner-hold gesture
(`EmojiStage.jsx`, originally top-left). PRD.md's success criteria promise the
settings surface is "nothing a child would find by accident"
(`docs/PRD.md`) — a visible button softens that promise, but it's what was
asked for, and the owner confirmed keeping the hold as a second entrance
rather than replacing it.

**Decision:** Added `MenuButton.jsx` in the top-right. Rather than leaving the
hidden hold in the top-left (now two unrelated corners for one feature), the
hold's arming zone was mirrored to the top-right so both entrances live in the
same corner. The zone's inset-from-the-edge logic (`CORNER_MARGIN`) is
unchanged in spirit — it now dodges iOS's right-edge forward-swipe recognizer
instead of the left-edge back-swipe one, for the same reason (see the
2026-08-14 corner-hold entry).

The tap counter took the top-left corner the hold vacated.

**Alternatives considered:** Leaving the hold in the top-left, menu button in
the top-right — rejected as two unrelated corners doing adjacent jobs, with no
benefit over sharing one. Dropping the hold entirely now that a visible button
exists — rejected; the owner explicitly asked to keep both.

**Reversible?** Yes — the arming-zone math and the counter's CSS position are
each self-contained.

---

### 2026-08-15 — Parent-only emoji category picker, staged until the menu closes

**Context:** The owner asked for a multi-select category picker in Settings so
a parent can narrow which emoji groups appear when tapping. `docs/PRD.md`
explicitly lists "Emoji categories or themes the child picks between" as out
of scope, on the grounds that "choice is friction" in the core loop. This
request is narrower than what that line rules out — it's a parent-only control
behind the existing corner-hold/menu-button gate, set once and left alone,
not a child-facing switcher — but it's still a direct reversal of a written
scope line, done on explicit owner instruction. `docs/PRD.md` was updated to
carve out the exception rather than silently ignoring it.

**Decision:** `EMOJI_CATEGORIES` (`src/data/emoji.js`) already had the right
shape — no data changes needed beyond adding `CATEGORY_META` for
display labels and a memoized `emojiForCategories()` to flatten a selection.
`pickRandomEmoji` gained an optional `pool` parameter (default: everything) so
`EmojiStage` can draw from the narrowed set without changing its no-repeat
behavior.

Selection is staged in local component state inside `SettingsPanel` and only
written to the settings store when the panel closes — sound and haptics kept
their existing immediate-write behavior, since only the category picker was
asked to work this way ("change goes into effect when the menu closes"). All
three exits (the primary button, Esc, and a backdrop tap) route through one
`commitAndClose()`.

A committed empty selection would leave taps producing nothing with no visible
explanation, so it's blocked rather than allowed: the primary button disables
at zero selected with an inline hint, and Esc/backdrop-tap fall through the
same guard. This was an explicit owner choice among three options (disable,
silently fall back to all categories, or allow the dead state).

**Alternatives considered:** Writing category changes immediately, like sound
and haptics — rejected, the owner specifically asked for a commit-on-close
gesture with a large confirmation button. Silently re-enabling all categories
on an empty commit — rejected as a UI that lies about what was just chosen.

**Reversible?** Yes — the staging state and the guard are localized to
`SettingsPanel`; reverting to immediate writes means removing the local
`staged` state and calling `onChange` directly from each chip.

---

### 2026-08-14 — Corner-hold zone inset from the screen edge

**Context:** A real-device test on an iPhone (Safari, normal tab, not
installed to home screen) reported the top-left corner hold not opening
Settings. Code review found nothing wrong with the timer/coordinate logic
itself. The best-supported hypothesis: `CORNER_SIZE` started the hold-arming
zone at `x: 0`, which overlaps the leftmost ~20-30px strip iOS Safari
reserves for its own edge-swipe-back gesture — a system-level recognizer
above WebKit's content view that no DOM API (`touch-action`,
`preventDefault`) can suppress. A hold that starts inside that strip can lose
the touch to iOS mid-gesture, which arrives in the page as a silent
`pointercancel` — wired to the same `cancelHold()` path as an ordinary
lift-off, so the timer aborts with no visible sign anything went wrong.

**Decision:** Added `CORNER_MARGIN = 24`; the hold now only arms for touches
with `clientX` between `CORNER_MARGIN` and `CORNER_MARGIN + CORNER_SIZE`,
keeping the whole gesture inside the region WebKit fully controls. Ordinary
taps anywhere, including in that margin strip, are unaffected — they still
spawn an emoji exactly as before; only which touches can *arm the hold timer*
changed.

**Caveat:** This is a hypothesis-driven fix, not a confirmed one.
`scripts/verify-app.mjs` dispatches synthetic `PointerEvent`s directly into
the DOM, which bypasses OS-level gesture recognizers entirely — it will
report PASS regardless of whether this actually fixes the real-device
behavior. Only a real-device retest confirms it. If the hold still doesn't
work after this, the next things to try are a larger margin or moving the
gesture off the screen edge entirely (e.g. a fixed on-screen zone that isn't
corner-anchored).

**Reversible?** Yes — one constant and one condition.

---

### 2026-08-14 — Flat background color, not a gradient

**Context:** `theme-color` (and the manifest's matching fields) tint iOS
Safari's translucent chrome from a single color. The body background was a
two-stop gradient (`--bg-top` → `--bg-bottom`), so the chrome color only
matched one end of the page — the other edge showed a visible seam between
Safari's flat-tinted chrome and the page's actual (different) color there.

**Decision:** Collapsed the gradient into a single flat `--bg` token, and set
`theme-color` plus the manifest's `background_color`/`theme_color` to that
exact hex, so chrome and content are the same color at every edge, not just
one.

**Reversible?** Yes, but re-adding a gradient means picking a new
`theme-color` compromise (or accepting a seam at whichever edge doesn't
match).

---

### 2026-08-14 — Tap counter reset lives in Settings, not on the chip

**Context:** The tap counter (top-right) needed a reset control. The obvious
place is a long-press directly on the counter chip itself, but that's a
gesture a curious toddler will find by accident within a normal play session
— the opposite of "tamper-proof."

**Decision:** The chip is display-only, with no pointer handlers of its own.
Reset is a button inside `SettingsPanel`, which is already gated behind the
2.5s top-left corner hold. Resetting the counter now takes the same
deliberate parent gesture as changing sound/haptics settings.

**Alternatives considered:** A long-press on the chip — rejected, not
toddler-proof. A separate corner-hold zone just for reset — rejected as
needless complexity when Settings already exists as the parent-only surface.

**Reversible?** Yes — the reset button and its handler are self-contained.

---

### 2026-08-14 — Onboarding hint's dismissal is a separate flag from the tap counter

**Context:** The onboarding hint ("Tap anywhere to make an emoji") needed to
fade after 3 taps. The simplest implementation drove both the hint and the
visible counter off the same `tapCount` state — but that means a parent
resetting the counter in Settings would also reset `tapCount` below 3 and
resurrect the tutorial message mid-session.

**Decision:** The hint's visibility is a one-way `hintDismissed` boolean,
set once `tapCount` first reaches 3 and never cleared afterward. The counter
and the hint share the same tap events but not the same piece of state, so
resetting one doesn't affect the other.

**Reversible?** Yes — it's one extra `useState` in `App.jsx`.

---

### 2026-08-14 — Corner hold spawns an emoji too

**Context:** The parent gesture lives in the top-left corner. The obvious
implementation puts an invisible element there to capture the hold, but that
element would swallow the tap — so the one part of the screen a child is most
likely to explore would be the one part that does nothing.

**Decision:** Hold detection runs inside the same `pointerdown` handler as
everything else. A corner tap pops an emoji exactly like any other tap; the hold
timer runs alongside it and only fires if the finger stays put for 2.5s.

**Alternatives considered:** A dedicated overlay element in the corner —
rejected because a dead zone is a bug from the child's point of view.

**Reversible?** Yes, trivially.

---

### 2026-08-14 — Pentatonic scale for pop sounds

**Context:** The PRD asks for "a soft musical pop" per tap but doesn't say what
pitch. With multi-touch, ten pops can fire in the same instant.

**Decision:** Each pop draws a random pitch from a C major pentatonic scale
spanning three octaves. A pentatonic scale has no semitones, so no two notes in
the set can clash — simultaneous taps land as a chord rather than a cluster.

**Alternatives considered:** A single fixed pitch (monotonous fast); a
chromatic range (dissonant when several fire together).

**Reversible?** Yes — it's one array in `src/lib/audio.js`.

---

### 2026-08-14 — Drop sounds past 8 concurrent voices instead of queueing

**Context:** Sustained mashing can request more simultaneous voices than is
pleasant, and stacked gain clips audibly.

**Decision:** Past 8 active voices, new pops render silently — the emoji still
appears, only the sound is skipped. During a mash a late sound is worse than no
sound, since it decouples from the tap that caused it.

**Reversible?** Yes — one constant.

---

### 2026-08-14 — Curated set capped at Unicode 12.0, single grapheme clusters

**Context:** The PRD asks for a kid-friendly set and for nothing to render as a
blank box, but doesn't define the technical boundary.

**Decision:** Every emoji must be a single grapheme cluster (no ZWJ sequences,
no skin-tone modifiers, no regional-indicator flags) and no newer than Unicode
12.0. ZWJ sequences split into their component glyphs on older iOS — a "family"
emoji becomes three people standing in a row — and post-12.0 emoji tofu-box on
tablets that haven't been updated. The Vitest suite enforces all of it, so the
constraint survives future additions to the list.

**Alternatives considered:** Trusting a hand-check of the list — rejected
because the failure is invisible on the dev machine and only shows up on the
actual device.

**Reversible?** Yes, but re-widening it requires testing on the real iPad.

---

### 2026-08-14 — Interval sweep as a backstop for `animationend`

**Context:** Emoji nodes remove themselves when their CSS animation ends. That
event is not guaranteed: background tabs throttle animations, and iOS fires
nothing while the app is suspended.

**Decision:** A 1-second interval drops any pop older than its lifetime plus a
500ms grace. Without it, returning to a backgrounded app shows a screen frozen
full of emoji that never clear.

**Reversible?** Yes, but don't — this is the fix for a bug that only appears
after the app has been left open, which is exactly how a child will use it.
