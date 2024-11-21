import {
  TerminalWatcherRegister,
  type TerminalInfo
} from '@extension/registers/terminal-watcher-register'

import { Controller } from '../types'

export class TerminalController extends Controller {
  readonly name = 'terminal'

  private get terminalWatcher() {
    return this.registerManager.getRegister(TerminalWatcherRegister)
  }

  async getTerminalsForMention(): Promise<TerminalInfo[]> {
    return this.terminalWatcher?.getAllTerminalInfos() || []
  }
}
