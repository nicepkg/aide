import { getErrorMsg } from '@extension/utils'
import * as vscode from 'vscode'

import { ChatController } from './controllers/chat.controller'
import { FileController } from './controllers/file.controller'
import { GitController } from './controllers/git.controller'
import { SystemController } from './controllers/system.controller'
import type {
  Controller,
  ControllerClass,
  ControllerMethod,
  WebviewPanel
} from './types'

class APIManager {
  private controllers: Map<string, Controller> = new Map()

  private webview: vscode.Webview | null = null

  constructor(
    private context: vscode.ExtensionContext,
    private panel: WebviewPanel,
    controllerClasses: ControllerClass[]
  ) {
    this.webview = panel.webview
    panel.webview.onDidReceiveMessage(this.handleMessage.bind(this))
    this.registerControllers(controllerClasses)
  }

  private registerControllers(controllerClasses: ControllerClass[]) {
    for (const ControllerClass of controllerClasses) {
      const controller = new ControllerClass()
      this.controllers.set(controller.name, controller)
    }
  }

  private async handleMessage(message: any) {
    const { id, controller: controllerName, method, data } = message
    const controller = this.controllers.get(controllerName)

    if (!controller || !(method in controller)) {
      this.sendError(id, `Method not found: ${controllerName}.${method}`)
      return
    }

    try {
      const result = await (controller[method] as ControllerMethod)(data)
      if (result && typeof result[Symbol.asyncIterator] === 'function') {
        for await (const chunk of result as AsyncGenerator<
          string,
          void,
          unknown
        >) {
          this.sendStream(id, chunk)
        }
        this.sendEnd(id)
      } else {
        this.sendResponse(id, result)
      }
    } catch (error) {
      this.sendError(id, getErrorMsg(error))
    }
  }

  private sendResponse(id: number, data: any) {
    this.webview?.postMessage({ id, type: 'response', data })
  }

  private sendStream(id: number, data: string) {
    this.webview?.postMessage({ id, type: 'stream', data })
  }

  private sendEnd(id: number) {
    this.webview?.postMessage({ id, type: 'end' })
  }

  private sendError(id: number, error: string) {
    this.webview?.postMessage({ id, type: 'error', error })
  }

  cleanUp() {
    this.controllers.clear()
    this.webview = null
  }
}

export const controllers = [
  ChatController,
  FileController,
  GitController,
  SystemController
] as const
export type Controllers = typeof controllers

export const setupWebviewAPIManager = (
  context: vscode.ExtensionContext,
  panel: WebviewPanel
): vscode.Disposable => {
  const apiManager = new APIManager(
    context,
    panel,
    controllers as any as ControllerClass[]
  )

  return {
    dispose: () => {
      apiManager.cleanUp()
    }
  }
}
