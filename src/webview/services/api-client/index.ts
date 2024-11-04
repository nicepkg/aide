import type { Controllers } from '@extension/webview-api/controllers'
import type { ControllerClass } from '@extension/webview-api/types'
import { io, Socket } from 'socket.io-client'

import type { APIType } from './types'

export class APIClient {
  private messageId = 0

  private socket!: Socket

  private pendingRequests: Map<
    number,
    {
      resolve: (value: any) => void
      reject: (reason: any) => void
      onStream?: (chunk: string) => void
    }
  > = new Map()

  constructor() {
    const port = window.vscodeWebviewState?.socketPort

    if (!port) throw new Error('Socket port not found in VSCode state')

    this.socket = io(`http://localhost:${port}`)
    this.socket.on('response', this.handleResponse.bind(this))
    this.socket.on('stream', this.handleStream.bind(this))
    this.socket.on('end', this.handleEnd.bind(this))
    this.socket.on('error', this.handleError.bind(this))
  }

  private handleResponse(message: { id: number; data: any }) {
    const pending = this.pendingRequests.get(message.id)
    if (pending) {
      pending.resolve(message.data)
      this.pendingRequests.delete(message.id)
    }
  }

  private handleStream(message: { id: number; data: string }) {
    const pending = this.pendingRequests.get(message.id)
    if (pending && pending.onStream) {
      pending.onStream(message.data)
    }
  }

  private handleEnd(message: { id: number }) {
    const pending = this.pendingRequests.get(message.id)
    if (pending) {
      pending.resolve(undefined)
      this.pendingRequests.delete(message.id)
    }
  }

  private handleError(message: { id: number; error: string }) {
    const pending = this.pendingRequests.get(message.id)
    if (pending) {
      pending.reject(new Error(message.error))
      this.pendingRequests.delete(message.id)
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
      this.socket.emit('request', { id, controller, method, data })
    })
  }
}

export const createWebviewApi = <T extends readonly ControllerClass[]>() => {
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
