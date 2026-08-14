import { useEffect, useState } from 'react'
import EmojiStage from './components/EmojiStage.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import OnboardingHint from './components/OnboardingHint.jsx'
import TapCounter from './components/TapCounter.jsx'
import {
  getSettings,
  setSetting,
  subscribeToSettings,
} from './lib/settings.js'

export default function App() {
  const [settings, setSettings] = useState(getSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [hintDismissed, setHintDismissed] = useState(false)

  useEffect(() => subscribeToSettings(setSettings), [])

  const handleTap = () => {
    setTapCount((count) => {
      const next = count + 1
      if (next >= 3) setHintDismissed(true)
      return next
    })
  }

  return (
    <>
      <EmojiStage onParentGesture={() => setSettingsOpen(true)} onTap={handleTap} />
      <OnboardingHint dismissed={hintDismissed} />
      <TapCounter count={tapCount} />
      {settingsOpen ? (
        <SettingsPanel
          settings={settings}
          onChange={setSetting}
          onClose={() => setSettingsOpen(false)}
          onResetCount={() => setTapCount(0)}
        />
      ) : null}
    </>
  )
}
