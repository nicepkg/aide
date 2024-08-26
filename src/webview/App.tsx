import { ChatEditor } from './components/chat-editor'
import { ChatProvider } from './contexts/chat-context'

export default function App() {
  return (
    <ChatProvider>
      <ChatEditor />
    </ChatProvider>
  )
}
