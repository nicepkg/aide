import type { CommandManager } from '@extension/commands/command-manager'
import type { RegisterManager } from '@extension/registers/register-manager'
import * as vscode from 'vscode'

export type WebviewPanel = vscode.WebviewPanel | vscode.WebviewView

export type ControllerMethodResult<T = any> =
  | Promise<T>
  | AsyncGenerator<string, void, unknown>

export type ControllerMethod<TReq = any, TRes = any> = (
  req: TReq
) => ControllerMethodResult<TRes>

export abstract class Controller {
  abstract readonly name: string

  protected registerManager: RegisterManager

  protected commandManager: CommandManager

  constructor(
    registerManager: RegisterManager,
    commandManager: CommandManager
  ) {
    this.registerManager = registerManager
    this.commandManager = commandManager
  }

  [key: string]: ControllerMethod | string | unknown | undefined
}

export type ControllerClass = new (
  registerManager: RegisterManager,
  commandManager: CommandManager
) => Controller
