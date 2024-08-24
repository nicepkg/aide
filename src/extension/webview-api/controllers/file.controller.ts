import * as fs from 'fs/promises'
import { logger } from '@extension/logger'

import { APIError } from '../types'
import { BaseController } from './base.controller'

export class FileController extends BaseController {
  name = 'file' as const

  handlers = {
    readFile: async (sessionId: string, params: { path: string }) => {
      try {
        const content = await fs.readFile(params.path, 'utf-8')
        return content
      } catch (error) {
        logger.warn(`Error reading file for session ${sessionId}:`, error)
        throw new APIError(
          'FILE_READ_ERROR',
          'Failed to read file',
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : String(error)
        )
      }
    },
    logChat: async (sessionId: string, params: { message: string }) => {
      try {
        await fs.appendFile(
          'chat.log',
          `[Session ${sessionId}] ${params.message}\n`
        )
        return 'Logged'
      } catch (error) {
        logger.warn(`Error logging chat for session ${sessionId}:`, error)
        throw new APIError(
          'LOG_ERROR',
          'Failed to log chat',
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : String(error)
        )
      }
    }
  }
}
