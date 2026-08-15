// Tiny localStorage-backed settings store.
//
// Deliberately not React state at the top of the tree: the audio and haptics
// modules read these on every tap, and threading props down for something a
// parent changes once a month isn't worth the re-renders.

import { CATEGORY_KEYS } from '../data/emoji.js'

const STORAGE_KEY = 'emoji-pop:settings'

const DEFAULTS = {
  sound: true,
  haptics: true,
  // Which emoji groups are in play. Everything, until a parent narrows it.
  categories: CATEGORY_KEYS,
}

let current = { ...DEFAULTS }
const listeners = new Set()

// localStorage throws in Safari private browsing, and a toy shouldn't die for
// want of a saved preference — every access is best-effort.
function safeRead() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function safeWrite(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Preference just won't persist across reloads. Not fatal.
  }
}

/**
 * Keep only real category keys, and fall back to the full set if nothing
 * survives. A key left behind by a future rename must not strand the toy with
 * an empty pool — the UI blocks an empty selection, but stored data predates
 * whatever the UI currently enforces.
 */
function readCategories(value) {
  if (!Array.isArray(value)) return DEFAULTS.categories
  const known = CATEGORY_KEYS.filter((key) => value.includes(key))
  return known.length > 0 ? known : DEFAULTS.categories
}

const stored = safeRead()
if (stored) {
  current = {
    sound: typeof stored.sound === 'boolean' ? stored.sound : DEFAULTS.sound,
    haptics:
      typeof stored.haptics === 'boolean' ? stored.haptics : DEFAULTS.haptics,
    categories: readCategories(stored.categories),
  }
}

export function getSettings() {
  return current
}

export function setSetting(key, value) {
  if (!(key in DEFAULTS)) return
  current = { ...current, [key]: value }
  safeWrite(current)
  for (const listener of listeners) listener(current)
}

export function subscribeToSettings(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
