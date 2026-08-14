import { useEffect, useRef } from 'react'
import { isHapticsSupported } from '../lib/haptics.js'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]'

/**
 * Parent-facing settings. This is the one surface a grown-up actually reads, so
 * it's also the one that has to meet the accessibility bar: 44px targets,
 * visible focus, Esc to close, and focus trapped while open.
 */
export default function SettingsPanel({ settings, onChange, onClose }) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    previouslyFocused.current = document.activeElement
    const panel = panelRef.current
    panel?.querySelector(FOCUSABLE)?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return

      const focusable = [...panel.querySelectorAll(FOCUSABLE)]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="settings-backdrop"
      data-interactive
      onPointerDown={(event) => {
        // Only a tap on the backdrop itself closes — not one that bubbled up
        // from inside the panel.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="settings"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        data-testid="settings"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <h1 className="settings__title" id="settings-title">
          Grown-up settings
        </h1>

        <Toggle
          label="Pop sound"
          checked={settings.sound}
          onChange={(value) => onChange('sound', value)}
        />

        <Toggle
          label="Vibration"
          checked={settings.haptics}
          disabled={!isHapticsSupported()}
          hint={
            isHapticsSupported()
              ? undefined
              : 'Not supported on this device'
          }
          onChange={(value) => onChange('haptics', value)}
        />

        <button className="settings__close" type="button" onClick={onClose}>
          Back to playing
        </button>

        <p className="settings__hint">
          Hold the top-left corner for 2.5 seconds to get back here.
        </p>
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange, disabled, hint }) {
  return (
    <label className="toggle" data-disabled={disabled || undefined}>
      <span className="toggle__label">
        {label}
        {hint ? <span className="toggle__hint">{hint}</span> : null}
      </span>
      <input
        className="toggle__input"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle__track" aria-hidden="true">
        <span className="toggle__thumb" />
      </span>
    </label>
  )
}
