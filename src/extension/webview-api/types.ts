import * as vscode from 'vscode'

export type WebviewPanel = vscode.WebviewPanel | vscode.WebviewView

export type APIHandler<T = any, R = any> = (
  this: Controller,
  sessionId: string,
  params: T
) => Promise<R>

export type ControllerHandlers = Record<string, APIHandler>
export type ControllerStreamHandlers = Record<
  string,
  (sessionId: string, data: any) => void
>
export interface Controller {
  name: string
  handlers: ControllerHandlers
  streamHandlers?: ControllerStreamHandlers
}

export type APIMethodMap = {
  [controllerName: string]: {
    [methodName: string]: {
      params: any
      result: any
      stream?: any
    }
  }
}

export class APIError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}
