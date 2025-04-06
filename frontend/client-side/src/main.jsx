import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthPages from './pages/AuthPage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthPages>
    <App />
    </AuthPages>
  </StrictMode>,
)
