import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { applyTheme } from './lib/theme'
import './lib/icons'

// el tema ya se aplicó en index.html antes de pintar; aquí se sigue el cambio del sistema operativo
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
