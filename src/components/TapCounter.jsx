/**
 * Display-only. Deliberately has no pointer handlers of its own — reset
 * lives behind the parent gesture in SettingsPanel, not on this chip, so
 * ordinary play can't zero it out by accident.
 */
export default function TapCounter({ count }) {
  return (
    <div className="tap-counter" aria-hidden="true">
      {count}
    </div>
  )
}
