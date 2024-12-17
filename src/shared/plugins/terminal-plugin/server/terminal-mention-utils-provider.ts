import type { ControllerRegister } from '@extension/registers/controller-register'
import type { Mention } from '@shared/entities'
import type { MentionUtilsProvider } from '@shared/plugins/base/server/create-provider-manager'

import { TerminalMentionType } from '../types'

export class TerminalMentionUtilsProvider implements MentionUtilsProvider {
  async createRefreshMentionFn(controllerRegister: ControllerRegister) {
    const terminals = await controllerRegister
      .api('terminal')
      .getTerminalsForMention()

    // Create a map of terminal processIds for quick lookup
    const terminalMap = new Map(
      terminals.map(terminal => [terminal.processId, terminal])
    )

    return (_mention: Mention) => {
      const mention = { ..._mention } as Mention
      switch (mention.type) {
        case TerminalMentionType.Terminal:
          const terminal = terminalMap.get(mention.data.processId)
          if (terminal) mention.data = terminal
          break
        default:
          break
      }

      return mention
    }
  }
}
