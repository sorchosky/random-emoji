# PRD — Emoji Pop

## Problem

A toddler wants to touch the screen and have something happen. Most apps aimed
at that age are cluttered with menus, ads, upsells, and buttons that lead
somewhere — all of which are just obstacles between a tap and a reaction. The
model here is tinyfingers.net: one surface, one gesture, immediate delight, and
no way to end up somewhere unintended.

## Users

One user: the owner's daughter, a toddler, on a family tablet. A parent is the
secondary user, and only ever to change a setting or hand over the device.

Because it's a child using it unsupervised for stretches, the polish bar is
higher than a personal tool in one specific way: it has to be impossible to
break or escape. Visual polish matters less than the app never once dropping her
into Safari, a share sheet, or a zoomed-in broken layout.

## Core loop

**Tap anywhere on the screen → a random emoji pops up at the fingertip, holds
for a couple of seconds, then fades away.**

That's the whole app. Everything else exists to protect that loop.

## Scope — this version

1. **Tap-to-pop.** Any tap anywhere spawns a random emoji at the touch point.
2. **Multi-touch and mashing.** Every finger spawns its own emoji; many can be
   on screen at once, each fading on its own schedule. A whole palm slapped on
   the glass should feel great, not break anything.
3. **Curated emoji set.** Kid-appropriate only, and only emoji that reliably
   render on the actual device.
4. **Toddler lock-down.** No zoom, no pull-to-refresh, no text selection, no
   long-press menus, no browser chrome when launched from the home screen.
5. **Sound.** A soft musical pop per emoji, mutable.
6. **Haptics.** A light buzz per tap where the device supports it.
7. **Parent gesture.** A deliberate hidden hold opens settings; nothing a child
   would find by accident.

## Explicitly out of scope

- Accounts, profiles, and anything that syncs
- Scores, levels, progress, streaks, or any reason to keep playing
- Emoji categories or themes the child picks between — choice is friction here
- Analytics or any network call at runtime
- Offline service worker (the app is tiny and the tablet is on home wifi;
  revisit only if it actually gets used away from the house)
- Any paid API or service

## Success criteria

- A tap produces an emoji in under 100ms, every time
- Five simultaneous fingers produce five distinct emoji
- Sixty taps in quick succession never exceeds 40 on-screen emoji, and the
  screen drains back to empty afterward
- No emoji in the set renders as a blank box on the target iPad
- Launched from the home screen: no address bar, no tabs, no browser UI at all
- Pinch, double-tap, and pull-down do nothing
- A child tapping the corner repeatedly never opens settings; a 2.5s hold does
- Zero console errors or warnings

## Constraints

- **Budget:** zero. No paid API, no service, no runtime network calls.
- **Timeline:** none, but it should be usable now rather than perfect later.
- **Devices:** iPad and iPhone Safari are the targets, launched from the home
  screen. Desktop browsers should work for development but aren't the point.
- **Must not change:** nothing yet — this is a new build.

## Open questions

- Does the fade duration feel right in practice, or does she want them to linger
  longer? Tune after watching her use it.
- Is a single hidden corner gesture enough, or does the panel need a second
  confirmation step once she's older and more deliberate?
