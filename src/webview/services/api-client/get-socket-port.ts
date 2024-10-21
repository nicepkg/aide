import { vscode } from '@webview/utils/vscode'

export const getSocketPort = (timeout = 12000) =>
  new Promise<number>((resolve, reject) => {
    const messageHandler = (event: any) => {
      const message = event.data
      if ('socketPort' in message) {
        window.removeEventListener('message', messageHandler)
        resolve(message.socketPort)
      }
    }

    window.addEventListener('message', messageHandler)

    vscode.postMessage({
      type: 'getVSCodeSocketPort'
    })

    setTimeout(() => {
      window.removeEventListener('message', messageHandler)
      reject(new Error('Timeout waiting for socket port'))
    }, timeout)
  })
