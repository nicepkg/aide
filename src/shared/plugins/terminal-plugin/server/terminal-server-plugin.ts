import type {
  ServerPlugin,
  ServerPluginContext
} from '@shared/plugins/base/server/server-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'

import type { TerminalPluginState } from '../types'
import { TerminalChatStrategyProvider } from './chat-strategy/terminal-chat-strategy-provider'
import { TerminalMentionUtilsProvider } from './terminal-mention-utils-provider'

export class TerminalServerPlugin implements ServerPlugin<TerminalPluginState> {
  id = PluginId.Terminal

  version: string = pkg.version

  private context: ServerPluginContext<TerminalPluginState> | null = null

  async activate(
    context: ServerPluginContext<TerminalPluginState>
  ): Promise<void> {
    this.context = context

    this.context.registerProvider(
      'chatStrategy',
      () => new TerminalChatStrategyProvider()
    )

    this.context.registerProvider(
      'mentionUtils',
      () => new TerminalMentionUtilsProvider()
    )
  }

  deactivate(): void {
    this.context = null
  }
}
