import { logger } from '@extension/logger'
import * as vscode from 'vscode'

import { APIManager } from '../api-manager'
import {
  APIError,
  APIMethodMap,
  Controller,
  type ControllerHandlers,
  type ControllerStreamHandlers
} from '../types'

export abstract class BaseController implements Controller {
  abstract name: string

  abstract handlers: ControllerHandlers

  streamHandlers?: ControllerStreamHandlers

  constructor(
    protected context: vscode.ExtensionContext,
    protected apiManager: APIManager<APIMethodMap>
  ) {}

  protected async safeCall<
    C extends keyof APIMethodMap,
    M extends keyof APIMethodMap[C]
  >(
    command: `${string & C}.${string & M}`,
    sessionId: string,
    params: APIMethodMap[C][M]['params']
  ): Promise<APIMethodMap[C][M]['result']> {
    try {
      return await this.apiManager.callHandler(command, sessionId, params)
    } catch (error) {
      logger.warn(`Error calling ${command}:`, error)

      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(
        'INTERNAL_ERROR',
        `Error calling ${command}`,
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : String(error)
      )
    }
  }
}
