import type {
  ServerPlugin,
  ServerPluginContext
} from '@shared/plugins/base/server/server-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'

import type { GitPluginState } from '../types'
import { GitChatStrategyProvider } from './chat-strategy/git-chat-strategy-provider'

export class GitServerPlugin implements ServerPlugin<GitPluginState> {
  id = PluginId.Git

  version: string = pkg.version

  private context: ServerPluginContext<GitPluginState> | null = null

  async activate(context: ServerPluginContext<GitPluginState>): Promise<void> {
    this.context = context

    this.context.registerProvider(
      'chatStrategy',
      () => new GitChatStrategyProvider()
    )
  }

  deactivate(): void {
    this.context = null
  }
}
