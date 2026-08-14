import { useEffect, useState } from 'react'
import EmojiStage from './components/EmojiStage.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import {
  getSettings,
  setSetting,
  subscribeToSettings,
} from './lib/settings.js'

export default function App() {
  const [settings, setSettings] = useState(getSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => subscribeToSettings(setSettings), [])

  return (
    <>
      <EmojiStage onParentGesture={() => setSettingsOpen(true)} />
      {settingsOpen ? (
        <SettingsPanel
          settings={settings}
          onChange={setSetting}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </>
  )
}
