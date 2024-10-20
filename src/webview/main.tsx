import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import { getSocketPort } from './services/api-client/get-socket-port'

async function main() {
  const socketPort = await getSocketPort()
  window.vscodeWebviewState = {
    ...window.vscodeWebviewState,
    socketPort
  }

  const { default: App } = await import('./App')
  const { api } = await import('./services/api-client')
  window.isWin = await api.system.isWindows({})

  ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  )
}

main()
