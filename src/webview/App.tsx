import { Toaster } from 'sonner'

import { ThemeSync } from './components/theme-sync'
import { Providers } from './contexts/providers'

import './styles/global.css'

import { ChatUI } from './components/chat/chat-ui'

export default function App() {
  return (
    <div className="h-full">
      <Toaster position="top-center" />
      <Providers>
        <div className="flex min-h-screen flex-col h-full">
          <main className="flex flex-1 flex-col h-full">
            <ChatUI />
          </main>
        </div>
        {/* <TailwindIndicator /> */}
      </Providers>
      <ThemeSync />
    </div>
  )
}
