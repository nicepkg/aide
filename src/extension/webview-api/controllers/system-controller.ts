import * as os from 'os'

import { Controller } from '../types'

export interface SystemInfo {
  os: string
  cpu: string
  memory: string
  platform: string
}

export class SystemController extends Controller {
  readonly name = 'system'

  async getSystemInfo(): Promise<SystemInfo> {
    return {
      os: `${os.type()} ${os.release()}`,
      cpu: os.cpus()[0]?.model || 'Unknown',
      memory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
      platform: os.platform()
    }
  }

  async isWindows(): Promise<boolean> {
    return os.platform() === 'win32'
  }
}
