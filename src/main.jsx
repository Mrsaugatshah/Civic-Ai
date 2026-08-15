import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply the persisted/default theme before React paints to avoid a white first-load flash.
const themeKey = 'civicai-theme'
const themes = ['gradient', 'light', 'dark', 'warm', 'gray']
const storedTheme = window.localStorage.getItem(themeKey)
const initialTheme = themes.includes(storedTheme) ? storedTheme : 'gradient'
document.documentElement.dataset.theme = initialTheme
document.documentElement.classList.toggle('dark', initialTheme === 'dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
