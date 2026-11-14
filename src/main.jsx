import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/fraunces/wght-italic.css'
import App from './App'
import './styles/base.css'
import './styles/home.css'
import './styles/screens.css'
import './styles/sheets.css'
import './styles/studio.css'

function applySavedAppearance() {
  try {
    const theme = window.localStorage.getItem('manikanta-portfolio-theme')
    if (['midnight', 'pearl', 'ocean'].includes(theme)) {
      document.documentElement.dataset.theme = theme
    }
    const textSize = window.localStorage.getItem('manikanta-portfolio-text-size')
    if (textSize === 'large') document.documentElement.dataset.textSize = 'large'
  } catch {
    // Preferences can be applied after mount if storage is unavailable.
  }
}

applySavedAppearance()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
