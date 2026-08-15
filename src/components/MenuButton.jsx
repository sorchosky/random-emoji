/**
 * Visible entry point into Settings, sitting in the same top-right corner as
 * the hidden 2.5s hold in EmojiStage — two ways in, one corner. `data-interactive`
 * is what tells EmojiStage's keyboard handler not to treat Space/Enter here as
 * a tap on the stage.
 */
export default function MenuButton({ onOpen }) {
  return (
    <button
      className="menu-button"
      type="button"
      data-interactive
      aria-label="Open menu"
      onClick={onOpen}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M4 6h16M4 12h16M4 18h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
