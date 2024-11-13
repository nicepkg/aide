import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import './styles/global.css'

import { ThemeSync } from './components/theme-sync'
import { SparklesText } from './components/ui/sparkles-text'
import { getSocketPort } from './services/api-client/get-socket-port'

const root = ReactDOM.createRoot(document.getElementById('app')!)

const AppWrapper = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [App, setApp] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    const init = async () => {
      const socketPort = await getSocketPort()
      window.vscodeWebviewState = {
        ...window.vscodeWebviewState,
        socketPort
      }

      const { default: AppComponent } = await import('./App')
      const { api } = await import('./services/api-client')
      window.isWin = await api.system.isWindows({})

      setApp(() => AppComponent)
      setIsLoading(false)
    }

    init()
  }, [])

  if (isLoading || !App) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <SparklesText text="AIDE" />
      </div>
    )
  }

  return (
    <HashRouter>
      <App />
    </HashRouter>
  )
}

root.render(
  <React.StrictMode>
    <ThemeSync />
    <AppWrapper />
  </React.StrictMode>
)
