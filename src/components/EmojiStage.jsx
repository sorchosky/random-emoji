import { useCallback, useEffect, useRef, useState } from 'react'
import { emojiForCategories, pickRandomEmoji } from '../data/emoji.js'
import { playPop, unlockAudio } from '../lib/audio.js'
import { buzz } from '../lib/haptics.js'
import { getSettings } from '../lib/settings.js'

// Must stay in sync with the animation duration in emoji.css. The node removes
// itself on animationend; this is only the belt-and-braces sweep for the case
// where animationend never fires (a backgrounded tab throttles animations, and
// iOS fires nothing at all while the app is suspended).
const LIFETIME_MS = 2650

// Hard ceiling on concurrent nodes. A determined toddler can out-tap the
// removal rate, and unbounded growth is what turns a smooth toy into a
// slideshow. Oldest gets evicted first.
const MAX_ON_SCREEN = 40

// Parent gesture: a deliberate hold in the top-right corner — the same corner
// as the visible menu button, so there's one place a parent reaches for
// settings regardless of which entrance they use. Sized and timed so ordinary
// play never triggers it.
//
// The hold zone is inset from the edge rather than starting at x: window.innerWidth.
// In a normal (non-standalone) Safari tab, the rightmost ~20-30px of the screen
// is claimed by iOS's own edge-swipe-forward gesture recognizer, which sits
// above WebKit's content view — no DOM API can suppress it. A hold that starts
// inside that strip can lose the touch to iOS mid-hold, which arrives here as a
// silent pointercancel that aborts the timer. Starting the zone short of that
// strip keeps the whole gesture inside WebKit's control.
const CORNER_MARGIN = 24
const CORNER_SIZE = 64
const HOLD_DURATION_MS = 2500
const HOLD_MOVE_TOLERANCE = 20

export default function EmojiStage({ onParentGesture, onTap }) {
  const [pops, setPops] = useState([])
  const nextId = useRef(0)
  const lastEmoji = useRef(undefined)
  const holdRef = useRef(null)

  const spawn = useCallback((x, y) => {
    const pool = emojiForCategories(getSettings().categories)
    const emoji = pickRandomEmoji(lastEmoji.current, pool)
    lastEmoji.current = emoji

    const pop = {
      id: nextId.current++,
      emoji,
      x,
      y,
      // Jitter so repeated taps on the same spot stay visually distinct
      // instead of stacking into one solid blob.
      rotation: Math.round((Math.random() - 0.5) * 40),
      size: 68 + Math.round(Math.random() * 44),
      bornAt: Date.now(),
    }

    setPops((current) => {
      const next = current.length >= MAX_ON_SCREEN ? current.slice(1) : current
      return [...next, pop]
    })

    playPop()
    buzz()
    onTap?.()
  }, [onTap])

  const remove = useCallback((id) => {
    setPops((current) => current.filter((pop) => pop.id !== id))
  }, [])

  const cancelHold = useCallback(() => {
    if (holdRef.current) {
      clearTimeout(holdRef.current.timer)
      holdRef.current = null
    }
  }, [])

  const handlePointerDown = useCallback(
    (event) => {
      // Every pointerdown is a real user gesture, which is the only moment iOS
      // will let us start the AudioContext.
      unlockAudio()
      spawn(event.clientX, event.clientY)

      if (
        event.clientX >= window.innerWidth - CORNER_MARGIN - CORNER_SIZE &&
        event.clientX <= window.innerWidth - CORNER_MARGIN &&
        event.clientY <= CORNER_SIZE
      ) {
        cancelHold()
        holdRef.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          timer: setTimeout(() => {
            holdRef.current = null
            onParentGesture?.()
          }, HOLD_DURATION_MS),
        }
      }
    },
    [spawn, cancelHold, onParentGesture],
  )

  const handlePointerMove = useCallback(
    (event) => {
      const hold = holdRef.current
      if (!hold || hold.pointerId !== event.pointerId) return
      const dx = event.clientX - hold.x
      const dy = event.clientY - hold.y
      if (Math.hypot(dx, dy) > HOLD_MOVE_TOLERANCE) cancelHold()
    },
    [cancelHold],
  )

  const handlePointerUp = useCallback(
    (event) => {
      const hold = holdRef.current
      if (hold && hold.pointerId === event.pointerId) cancelHold()
    },
    [cancelHold],
  )

  // Keyboard path, so the toy is usable without a touchscreen and meets the
  // keyboard-navigable bar in CLAUDE.md.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== ' ' && event.key !== 'Enter') return
      if (event.target.closest('[data-interactive]')) return
      event.preventDefault()
      unlockAudio()
      spawn(
        window.innerWidth * (0.2 + Math.random() * 0.6),
        window.innerHeight * (0.2 + Math.random() * 0.6),
      )
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [spawn])

  // Safety sweep for pops whose animationend never arrived.
  useEffect(() => {
    if (pops.length === 0) return undefined
    const interval = setInterval(() => {
      const cutoff = Date.now() - LIFETIME_MS - 500
      setPops((current) => current.filter((pop) => pop.bornAt > cutoff))
    }, 1000)
    return () => clearInterval(interval)
  }, [pops.length])

  useEffect(() => cancelHold, [cancelHold])

  return (
    <div
      className="stage"
      data-testid="stage"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {pops.map((pop) => (
        <div
          key={pop.id}
          className="emoji"
          data-testid="emoji"
          style={{ left: `${pop.x}px`, top: `${pop.y}px` }}
          onAnimationEnd={() => remove(pop.id)}
        >
          <span
            className="emoji__glyph"
            style={{
              '--emoji-rotation': `${pop.rotation}deg`,
              fontSize: `${pop.size}px`,
            }}
          >
            {pop.emoji}
          </span>
        </div>
      ))}
    </div>
  )
}
