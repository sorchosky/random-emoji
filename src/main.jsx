import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

// Toddler-proofing that CSS can't express. Each of these is a gesture that
// would otherwise pull her out of the app or break the stage mid-tap.
function blockUnwantedGestures() {
  // iOS pinch-zoom. Non-standard events, Safari only.
  for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(type, (event) => event.preventDefault())
  }

  // Long-press callout / right-click menu.
  document.addEventListener('contextmenu', (event) => event.preventDefault())

  // Double-tap-to-zoom. touch-action: none covers this on modern iOS, but
  // older WebKit still needs the explicit block.
  document.addEventListener(
    'dblclick',
    (event) => event.preventDefault(),
    { passive: false },
  )
}

blockUnwantedGestures()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
