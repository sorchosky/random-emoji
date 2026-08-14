import { getSettings } from './settings.js'

// iOS Safari does not implement the Vibration API at all, so on the primary
// target device this is a no-op by design. It buzzes on Android.
const supported =
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

export function isHapticsSupported() {
  return supported
}

/** A single short buzz. Long enough to feel, short enough to not tickle. */
export function buzz() {
  if (!supported || !getSettings().haptics) return
  try {
    navigator.vibrate(12)
  } catch {
    // Some browsers throw if called outside a user gesture. Nothing to do.
  }
}
