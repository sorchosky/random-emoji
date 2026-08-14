/**
 * Fades out permanently after the third tap — one soft nudge for whoever
 * hands the tablet over, not something a returning player has to see again
 * once she already knows what to do. `dismissed` is a one-way flag owned by
 * the caller, deliberately independent of the tap counter so a parent
 * resetting the counter in Settings doesn't resurrect the tutorial.
 */
export default function OnboardingHint({ dismissed }) {
  return (
    <p
      className="onboarding-hint"
      data-dismissed={dismissed || undefined}
      aria-hidden={dismissed || undefined}
    >
      Tap anywhere to make an emoji
    </p>
  )
}
