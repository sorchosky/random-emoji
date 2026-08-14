# Decisions Log — Emoji Pop

> Append-only. Claude Code adds an entry any time it makes a judgment call the
> PRD didn't specify, or you make a call together mid-build. Newest at top.
> This is what keeps a second session (or a second project) from re-deciding
> something already settled.

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
