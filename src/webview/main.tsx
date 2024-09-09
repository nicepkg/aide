import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import { api } from './services/api-client'

async function main() {
  window.isWin = await api.system.isWindows({})

  ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

main()
