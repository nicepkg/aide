import type { Controllers } from '@extension/webview-api/controllers'
import type { ControllerClass } from '@extension/webview-api/types'
import { AbortError } from '@shared/utils/common'
import { io, Socket } from 'socket.io-client'

import type { APIType } from './types'

type PendingRequest = {
  resolve: (value: any) => void
  reject: (reason: any) => void
  onStream?: (chunk: string) => void
  abortController?: AbortController
}

export class APIClient {
  private messageId = 0

  private socket!: Socket

  private pendingRequests: Map<number, PendingRequest> = new Map()

  init() {
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
    onStream?: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<TRes> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++
      const abortController = signal ? new AbortController() : undefined

      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            this.socket.emit(`abort-${id}`, { id })
            const pending = this.pendingRequests.get(id)
            if (pending) {
              pending.reject(AbortError)
              this.pendingRequests.delete(id)
            }
          },
          { once: true }
        )
      }

      this.pendingRequests.set(id, {
        resolve,
        reject,
        onStream,
        abortController
      })

      this.socket.emit('request', { id, controller, method, data })
    })
  }
}

export const createWebviewApi = <T extends readonly ControllerClass[]>() => {
  const apiClient = new APIClient()
  const api = new Proxy({} as APIType<T>, {
    get: (target, controllerName: string) =>
      new Proxy(
        {},
        {
          get:
            (_, method: string) =>
            (
              req: any,
              onStream?: (chunk: string) => void,
              signal?: AbortSignal
            ) =>
              apiClient.request(controllerName, method, req, onStream, signal)
        }
      )
  }) as APIType<T>

  const initApi = apiClient.init.bind(apiClient)

  return { api, initApi }
}

export const { api, initApi } = createWebviewApi<Controllers>()
