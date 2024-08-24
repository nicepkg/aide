import * as vscode from 'vscode'

import { APIManager } from './api-manager'
import { ChatController } from './controllers/chat.controller'
import { FileController } from './controllers/file.controller'
import type { APIMethodMap, WebviewPanel } from './types'

type Mutable<T> = { -readonly [P in keyof T]: T[P] }

type InstanceTypeOfArray<T extends ReadonlyArray<new (...args: any) => any>> = {
  [K in keyof T]: T[K] extends new (...args: any) => infer R ? R : never
}

const controllerConstructors = [ChatController, FileController] as const

export type Controllers = Mutable<
  InstanceTypeOfArray<typeof controllerConstructors>
>

export const setupWebviewAPIManager = (
  context: vscode.ExtensionContext,
  panel: WebviewPanel
): vscode.Disposable => {
  const apiManager = new APIManager<APIMethodMap>(context, panel)

  controllerConstructors.forEach(Controller => {
    apiManager.registerController(Controller)
  })

  return {
    dispose: () => {
      apiManager.cleanUp()
    }
  }
}
