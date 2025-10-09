import React from 'react'
import ReactDOM from 'react-dom/client'
import ChatApp from './ChatApp.tsx'
import './index.css'

// Use ChatApp (Persian Chat) as the main app
// To switch to the rental management app, import App instead
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatApp />
  </React.StrictMode>,
)