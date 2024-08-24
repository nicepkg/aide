/* eslint-disable @typescript-eslint/ban-ts-comment */

import { logger } from '@extension/logger'
import * as vscode from 'vscode'

import {
  REQUEST_CLEANUP_INTERVAL,
  REQUEST_CLEANUP_THRESHOLD,
  REQUEST_TIMEOUT
} from './constant'
import type { BaseController } from './controllers/base.controller'
import {
  APIError,
  APIHandler,
  APIMethodMap,
  Controller,
  type WebviewPanel
} from './types'

export class APIManager<T extends APIMethodMap> {
  private handlers: Record<string, APIHandler> = {}

  private streamHandlers: Record<
    string,
    (sessionId: string, data: any) => void
  > = {}

  private controllers: Record<string, Controller> = {}

  private panel: WebviewPanel

  private pendingRequests: Map<
    string,
    { timestamp: number; reject: (reason?: any) => void }
  > = new Map()

  private disposes: vscode.Disposable[] = []

  constructor(
    private context: vscode.ExtensionContext,
    panel: WebviewPanel
  ) {
    this.panel = panel
    this.setupMessageListener()
    this.startRequestCleaner()
  }

  registerController(
    ControllerClass: new (
      ...args: ConstructorParameters<typeof BaseController>
    ) => BaseController
  ) {
    const controller = new ControllerClass(this.context, this)
    this.controllers[controller.name] = controller
    Object.entries(controller.handlers).forEach(([key, handler]) => {
      this.handlers[`${controller.name}.${key}`] = handler.bind(controller)
    })
    if (controller.streamHandlers) {
      Object.entries(controller.streamHandlers).forEach(([key, handler]) => {
        this.streamHandlers[`${controller.name}.${key}`] =
          handler.bind(controller)
      })
    }
  }

  private setupMessageListener() {
    const onDidReceiveMessageDispose = this.panel.webview.onDidReceiveMessage(
      async (message: any) => {
        const { id, sessionId, command, params } = message
        if (this.pendingRequests.has(id)) {
          this.sendErrorToWebview(
            id,
            sessionId,
            'DUPLICATE_REQUEST',
            'Duplicate request ID'
          )
          return
        }

        const handler = this.handlers[command]
        if (handler) {
          const timeoutPromise = this.createTimeout(id, REQUEST_TIMEOUT)

          this.pendingRequests.set(id, {
            timestamp: Date.now(),
            reject: timeoutPromise.reject
          })

          try {
            const result = await Promise.race([
              // @ts-ignore
              handler(sessionId, params),
              timeoutPromise.promise
            ])
            await this.sendResultToWebview(id, sessionId, result)
          } catch (error) {
            await this.handleError(id, sessionId, command, error)
          } finally {
            this.pendingRequests.delete(id)
          }
        } else {
          await this.sendErrorToWebview(
            id,
            sessionId,
            'HANDLER_NOT_FOUND',
            `Handler not found: ${command}`
          )
        }
      }
    )

    this.disposes.push(onDidReceiveMessageDispose)
  }

  private createTimeout(
    id: string,
    ms: number
  ): { promise: Promise<never>; reject: (reason?: any) => void } {
    let reject: (reason?: any) => void

    const promise = new Promise<never>((_, rej) => {
      reject = rej
      const timer = setTimeout(
        () => rej(new APIError('TIMEOUT', 'Request timed out')),
        ms
      )

      this.disposes.push({
        dispose: () => clearTimeout(timer)
      })
    })
    return { promise, reject: reject! }
  }

  private async sendResultToWebview(
    id: string,
    sessionId: string,
    result: any
  ) {
    await this.panel.webview.postMessage({ id, sessionId, result })
  }

  private async sendErrorToWebview(
    id: string,
    sessionId: string,
    code: string,
    message: string,
    details?: any
  ) {
    await this.panel.webview.postMessage({
      id,
      sessionId,
      error: { code, message, details }
    })
  }

  private async handleError(
    id: string,
    sessionId: string,
    command: string,
    error: any
  ) {
    logger.warn(`Error in handler for ${command}:`, error)
    if (error instanceof APIError) {
      await this.sendErrorToWebview(
        id,
        sessionId,
        error.code,
        error.message,
        error.details
      )
    } else {
      await this.sendErrorToWebview(
        id,
        sessionId,
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : String(error)
      )
    }
  }

  async sendToWebview(command: string, sessionId: string, data: any) {
    const streamHandler = this.streamHandlers[command]

    if (streamHandler) {
      streamHandler(sessionId, data)
    }

    await this.panel.webview.postMessage({ command, sessionId, data })
  }

  async callHandler<C extends keyof T, M extends keyof T[C]>(
    command: `${string & C}.${string & M}`,
    sessionId: string,
    params: T[C][M]['params']
  ): Promise<T[C][M]['result']> {
    const handler = this.handlers[command]

    if (handler) {
      try {
        // @ts-ignore
        return (await handler(sessionId, params)) as T[C][M]['result']
      } catch (error) {
        logger.warn(`Error in handler ${command}:`, error)
        throw error
      }
    }

    throw new APIError('HANDLER_NOT_FOUND', `Handler not found: ${command}`)
  }

  private startRequestCleaner() {
    const timer = setInterval(() => {
      const now = Date.now()

      for (const [
        id,
        { timestamp, reject }
      ] of this.pendingRequests.entries()) {
        if (now - timestamp > REQUEST_CLEANUP_THRESHOLD) {
          reject(
            new APIError('TIMEOUT', 'Request timed out and was cleaned up')
          )
          this.pendingRequests.delete(id)
        }
      }
    }, REQUEST_CLEANUP_INTERVAL)

    this.disposes.push({
      dispose: () => clearInterval(timer)
    })
  }

  cleanUp() {
    this.disposes.forEach(dispose => dispose.dispose())
  }
}
