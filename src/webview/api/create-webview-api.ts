import type { Controllers } from '@extension/webview-api'
import type {
  APIHandler,
  Controller as ControllerType
} from '@extension/webview-api/types'
import { vscode } from '@webview/helpers/vscode'

type ExtractMethodMap<T extends ControllerType> = T extends { name: infer N }
  ? {
      [K in N & string]: {
        [M in keyof T['handlers']]: T['handlers'][M] extends APIHandler<
          infer P,
          infer R
        >
          ? { params: P; result: R }
          : never
      }
    }
  : never

type CombineMethodMaps<T extends ControllerType[]> = (
  T extends (infer U)[]
    ? U extends ControllerType
      ? ExtractMethodMap<U>
      : never
    : never
) extends infer O
  ? { [K in keyof O]: O[K] }
  : never

type MergeMethodMaps<T> = (T extends any ? (x: T) => void : never) extends (
  x: infer R
) => void
  ? R
  : never

const createWebviewApi = <T extends ControllerType[]>() => {
  type MethodMap = MergeMethodMaps<CombineMethodMaps<T>>

  const callbacks: Record<
    string,
    { resolve: (value: any) => void; reject: (reason: any) => void }
  > = {}
  const streamHandlers: Record<string, (sessionId: string, data: any) => void> =
    {}

  window.addEventListener('message', event => {
    const { id, sessionId, command, result, error, data } = event.data
    if (id) {
      const callback = callbacks[id]
      if (callback) {
        if (error) {
          callback.reject(new Error(JSON.stringify(error)))
        } else {
          callback.resolve(result)
        }
        delete callbacks[id]
      }
    } else if (command) {
      const handler = streamHandlers[command]
      if (handler) {
        handler(sessionId, data)
      }
    }
  })

  const sendMessage = <C extends keyof MethodMap, M extends keyof MethodMap[C]>(
    command: `${string & C}.${string & M}`,
    sessionId: string,
    params: MethodMap[C][M] extends { params: infer P } ? P : never
  ): Promise<MethodMap[C][M] extends { result: infer R } ? R : never> =>
    new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2)
      callbacks[id] = { resolve, reject }
      vscode.postMessage({ command, sessionId, params, id })
    })

  const onStream = <C extends keyof MethodMap, M extends keyof MethodMap[C]>(
    command: `${string & C}.${string & M}`,
    handler: (sessionId: string, data: any) => void
  ): void => {
    streamHandlers[command] = handler
  }

  return { sendMessage, onStream }
}

export const api = createWebviewApi<Controllers>()
// api.sendMessage('chat.startChat', 'aaa', {
//   text: 'Hello'
// })
