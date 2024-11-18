import type { CommandManager } from '@extension/commands/command-manager'
import type { RegisterManager } from '@extension/registers/register-manager'
import { getErrorMsg, isAbortError } from '@shared/utils/common'
import findFreePorts from 'find-free-ports'
import { Server } from 'socket.io'
import * as vscode from 'vscode'

import { controllers } from './controllers'
import type {
  Controller,
  ControllerClass,
  ControllerMethod,
  WebviewPanel
} from './types'

class APIManager {
  private controllers: Map<string, Controller> = new Map()

  private io!: Server

  private port!: number

  private disposes: vscode.Disposable[] = []

  constructor(
    private context: vscode.ExtensionContext,
    private registerManager: RegisterManager,
    private commandManager: CommandManager
  ) {}

  public async initialize(
    panel: WebviewPanel,
    controllerClasses: ControllerClass[]
  ) {
    await this.initializeServer()
    this.registerControllers(controllerClasses)

    const listenerDispose = panel.webview.onDidReceiveMessage(e => {
      if (e.type === 'getVSCodeSocketPort') {
        panel.webview.postMessage({ socketPort: this.port })
      }
    })

    this.disposes.push(listenerDispose)
  }

  private async initializeServer() {
    const freePorts = await findFreePorts.findFreePorts(1, {
      startPort: 3001,
      endPort: 7999
    })

    if (!freePorts.length) throw new Error('No free ports found')

    this.port = freePorts[0]!
    this.io = new Server(this.port, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })
    this.io.on('connection', socket => {
      socket.on('request', this.handleMessage.bind(this, socket))
    })
  }

  private registerControllers(controllerClasses: ControllerClass[]) {
    for (const ControllerClass of controllerClasses) {
      const controller = new ControllerClass(
        this.registerManager,
        this.commandManager
      )
      this.controllers.set(controller.name, controller)
    }
  }

  private async handleMessage(socket: any, message: any) {
    const { id, controller: controllerName, method, data } = message
    const controller = this.controllers.get(controllerName)
    const abortController = new AbortController()

    socket.once(`abort-${id}`, () => {
      abortController.abort()
    })

    if (!controller || !(method in controller)) {
      socket.emit('error', {
        id,
        error: `Method not found: ${controllerName}.${method}`
      })
      return
    }

    try {
      const result = await (controller[method] as ControllerMethod)(
        data,
        abortController
      )
      if (result && typeof result[Symbol.asyncIterator] === 'function') {
        try {
          for await (const chunk of result as AsyncGenerator<
            any,
            void,
            unknown
          >) {
            if (abortController.signal.aborted) break
            socket.emit('stream', { id, data: chunk })
          }
          socket.emit('end', { id })
        } catch (error) {
          // skip abort error
          if (isAbortError(error)) {
            socket.emit('aborted', { id })
          } else {
            throw error
          }
        }
      } else {
        socket.emit('response', { id, data: result })
      }
    } catch (error) {
      socket.emit('error', { id, error: getErrorMsg(error) })
    }
  }

  dispose() {
    this.disposes.forEach(dispose => dispose.dispose())
    this.controllers.clear()
    this.io.close()
  }
}

export const setupWebviewAPIManager = async (
  context: vscode.ExtensionContext,
  panel: WebviewPanel,
  registerManager: RegisterManager,
  commandManager: CommandManager
): Promise<vscode.Disposable> => {
  const apiManager = new APIManager(context, registerManager, commandManager)

  await apiManager.initialize(panel, controllers as any as ControllerClass[])

  return {
    dispose: () => {
      apiManager.dispose()
    }
  }
}
