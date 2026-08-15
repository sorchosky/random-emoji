import { useCallback, useEffect, useRef, useState } from 'react'
import { CATEGORY_KEYS, CATEGORY_META } from '../data/emoji.js'
import { isHapticsSupported } from '../lib/haptics.js'

// :not([disabled]) matters once the primary button can be disabled — an
// unfocusable node in this list would dead-end Tab at the last real control.
const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]'

/**
 * Parent-facing settings. This is the one surface a grown-up actually reads, so
 * it's also the one that has to meet the accessibility bar: 44px targets,
 * visible focus, Esc to close, and focus trapped while open.
 */
export default function SettingsPanel({
  settings,
  onChange,
  onClose,
  onResetCount,
}) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  // Category selection is staged locally and only written to the store when
  // the panel closes — sound/haptics stay immediate, writing through `onChange`
  // as they always have.
  const [staged, setStaged] = useState(settings.categories)
  const stagedRef = useRef(staged)
  stagedRef.current = staged

  const toggleCategory = useCallback((key) => {
    setStaged((current) =>
      current.includes(key)
        ? current.filter((existing) => existing !== key)
        : [...current, key],
    )
  }, [])

  // A committed empty selection would leave taps producing nothing with no
  // visible explanation, so it's a no-op instead: the primary button disables,
  // Esc and the backdrop tap both fall through to this same guard.
  const commitAndClose = useCallback(() => {
    if (stagedRef.current.length === 0) return
    onChange('categories', stagedRef.current)
    onClose()
  }, [onChange, onClose])

  useEffect(() => {
    previouslyFocused.current = document.activeElement
    const panel = panelRef.current
    panel?.querySelector(FOCUSABLE)?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        commitAndClose()
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
  }, [commitAndClose])

  const canClose = staged.length > 0

  return (
    <div
      className="settings-backdrop"
      data-interactive
      onPointerDown={(event) => {
        // Only a tap on the backdrop itself closes — not one that bubbled up
        // from inside the panel.
        if (event.target === event.currentTarget) commitAndClose()
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

        <section className="settings__section" aria-labelledby="categories-title">
          <div className="settings__section-header">
            <h2 className="settings__section-title" id="categories-title">
              Emoji groups
            </h2>
            <div className="settings__bulk-actions">
              <button
                type="button"
                className="settings__bulk-button"
                onClick={() => setStaged(CATEGORY_KEYS)}
              >
                Select all
              </button>
              <button
                type="button"
                className="settings__bulk-button"
                onClick={() => setStaged([])}
              >
                Deselect all
              </button>
            </div>
          </div>

          <div className="category-grid" role="group" aria-labelledby="categories-title">
            {CATEGORY_KEYS.map((key) => (
              <CategoryChip
                key={key}
                label={CATEGORY_META[key].label}
                sample={CATEGORY_META[key].sample}
                selected={staged.includes(key)}
                onToggle={() => toggleCategory(key)}
              />
            ))}
          </div>
        </section>

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

        <button
          className="settings__reset"
          type="button"
          onClick={onResetCount}
        >
          Reset tap counter
        </button>

        <button
          className="settings__close"
          type="button"
          disabled={!canClose}
          onClick={commitAndClose}
        >
          Back to playing
        </button>
        {canClose ? null : (
          <p className="settings__warning" role="alert">
            Pick at least one group to keep playing.
          </p>
        )}

        <p className="settings__hint">
          Hold the top-right corner for 2.5 seconds to get back here.
        </p>
      </div>
    </div>
  )
}

function CategoryChip({ label, sample, selected, onToggle }) {
  return (
    <button
      type="button"
      className="category-chip"
      data-selected={selected || undefined}
      aria-pressed={selected}
      onClick={onToggle}
    >
      <span className="category-chip__sample" aria-hidden="true">
        {sample}
      </span>
      <span className="category-chip__label">{label}</span>
    </button>
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
