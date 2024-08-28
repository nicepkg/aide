import { Toaster } from 'sonner'

import { ThemeSync } from './components/theme-sync'
import { Providers } from './contexts/providers'

import './styles/global.css'

import { ChatUI } from './components/chat/chat-ui'

export default function App() {
  return (
    <div>
      <Toaster position="top-center" />
      <Providers>
        <div className="flex min-h-screen flex-col">
          <main className="bg-muted/50 flex flex-1 flex-col">
            <ChatUI />
            {/* <ChatProvider>
              <ChatEditor />
            </ChatProvider>
            <Button>Hello</Button> */}
          </main>
        </div>
        {/* <TailwindIndicator /> */}
      </Providers>
      <ThemeSync />
    </div>
  )
}
