import { getSettings } from './settings.js'

// Synthesized pops rather than audio files: nothing to download, no decode
// latency on the first tap, and each pop can be a different pitch for free.
//
// Notes come from a C major pentatonic scale spanning three octaves. Pentatonic
// has no semitone clashes, so a toddler mashing ten fingers at once produces
// something that sounds like a chord instead of a car alarm.
const PENTATONIC = [
  261.63, 293.66, 329.63, 392.0, 440.0, // C4 D4 E4 G4 A4
  523.25, 587.33, 659.25, 783.99, 880.0, // C5 D5 E5 G5 A5
  1046.5, 1174.66, 1318.51, // C6 D6 E6
]

const MAX_VOICES = 8

let context = null
let masterGain = null
let activeVoices = 0

/**
 * Create (or resume) the AudioContext. MUST be called from inside a user
 * gesture handler — iOS starts every context suspended and only a real touch
 * can unlock it. Safe to call on every tap; it's a no-op once running.
 */
export function unlockAudio() {
  if (typeof window === 'undefined') return

  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    try {
      context = new AudioContextClass()
      masterGain = context.createGain()
      masterGain.gain.value = 0.22
      masterGain.connect(context.destination)
    } catch {
      context = null
      return
    }
  }

  if (context.state === 'suspended') {
    context.resume().catch(() => {})
  }
}

/** One short pop at a random pentatonic pitch. */
export function playPop() {
  if (!getSettings().sound) return

  unlockAudio()
  if (!context || context.state !== 'running') return

  // Drop the pop rather than queue it — during a mash, a late sound is worse
  // than no sound, and stacking voices past this point just clips.
  if (activeVoices >= MAX_VOICES) return

  const frequency = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)]
  const now = context.currentTime
  const duration = 0.26

  const oscillator = context.createOscillator()
  oscillator.type = 'triangle'
  // A quick upward glide is what makes it read as a "pop" rather than a beep.
  oscillator.frequency.setValueAtTime(frequency * 0.75, now)
  oscillator.frequency.exponentialRampToValueAtTime(frequency, now + 0.045)

  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0.0001, now)
  envelope.gain.exponentialRampToValueAtTime(1, now + 0.005)
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(envelope)
  envelope.connect(masterGain)

  activeVoices += 1
  oscillator.onended = () => {
    activeVoices -= 1
    oscillator.disconnect()
    envelope.disconnect()
  }

  oscillator.start(now)
  oscillator.stop(now + duration)
}
