import * as vscode from 'vscode'

export type WebviewPanel = vscode.WebviewPanel | vscode.WebviewView

export type ControllerMethodResult<T = any> =
  | Promise<T>
  | AsyncGenerator<string, void, unknown>

export type ControllerMethod<TReq = any, TRes = any> = (
  req: TReq
) => ControllerMethodResult<TRes>

export abstract class Controller {
  abstract readonly name: string;

  [key: string]: ControllerMethod | string | unknown | undefined
}

export type ControllerClass = new () => Controller
