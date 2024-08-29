import { useState } from 'react'

import { api } from './api/api-client'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'
import { vscode } from './utils/vscode'

export default function App() {
  const onPostMessage = () => {
    vscode.postMessage({
      command: 'hello',
      text: 'Hey there partner! 🤠'
    })
  }

  const [message, setMessage] = useState('')
  const [state, setState] = useState('')

  const onSetState = () => {
    vscode.setState(state)
  }
  const onGetState = async () => {
    console.log('state', await vscode.getState())
    setState((await vscode.getState()) as string)

    const msg = await api.chat.sendMessage?.({ message: 'Hello, AI!' })
    console.log(msg)

    console.log('api get msg:', msg)
  }

  return (
    <main>
      <h1>Hello React!</h1>
      <Button onClick={onPostMessage}>Test VSCode Message</Button>
      <div>
        <Textarea
          value={message}
          onInput={(e: any) => setMessage(e?.target?.value)}
        >
          Please enter a message
        </Textarea>
        <div>Message is: {message}</div>
      </div>
      <div>
        <Textarea
          value={state}
          onInput={(e: any) => setState(e?.target?.value)}
        >
          Please enter a state
        </Textarea>
        <div>State is: {state}</div>
        <div>
          <Button onClick={onSetState}>setState</Button>
          <Button style={{ marginLeft: '8px' }} onClick={onGetState}>
            getState
          </Button>
        </div>
      </div>
    </main>
  )
}
