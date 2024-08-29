import type { Controllers } from '@extension/webview-api'
import type { Controller } from '@extension/webview-api/types'
import { vscode } from '@webview/utils/vscode'

import type { ApiResponse, APIType } from './types'

export class APIClient {
  private messageId = 0

  private pendingRequests: Map<
    number,
    {
      resolve: (value: any) => void
      reject: (reason: any) => void
      onStream?: (chunk: string) => void
    }
  > = new Map()

  constructor() {
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  private handleMessage(event: MessageEvent) {
    const message: ApiResponse<any> & { id: number } = event.data
    const pending = this.pendingRequests.get(message.id)

    if (!pending) return

    switch (message.type) {
      case 'response':
        pending.resolve(message.data)
        this.pendingRequests.delete(message.id)
        break
      case 'stream':
        pending.onStream?.(message.data)
        break
      case 'end':
        pending.resolve(undefined)
        this.pendingRequests.delete(message.id)
        break
      case 'error':
        pending.reject(new Error(message.error))
        this.pendingRequests.delete(message.id)
        break
      default:
        break
    }
  }

  async request<TReq, TRes>(
    controller: string,
    method: string,
    data: TReq,
    onStream?: (chunk: string) => void
  ): Promise<TRes> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++
      this.pendingRequests.set(id, { resolve, reject, onStream })
      vscode.postMessage({ id, controller, method, data })
    })
  }
}

export const createWebviewApi = <
  T extends readonly (new () => Controller)[]
>() => {
  const apiClient = new APIClient()
  return new Proxy({} as APIType<T>, {
    get: (target, controllerName: string) =>
      new Proxy(
        {},
        {
          get:
            (_, method: string) =>
            (req: any, onStream?: (chunk: string) => void) =>
              apiClient.request(controllerName, method, req, onStream)
        }
      )
  }) as APIType<T>
}

export const api = createWebviewApi<Controllers>()
