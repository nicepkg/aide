import type {
  ServerPlugin,
  ServerPluginContext
} from '@shared/plugins/base/server/server-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'

import type { DocPluginState } from '../types'
import { DocChatStrategyProvider } from './chat-strategy/doc-chat-strategy-provider'

export class DocServerPlugin implements ServerPlugin<DocPluginState> {
  id = PluginId.Doc

  version: string = pkg.version

  private context: ServerPluginContext<DocPluginState> | null = null

  async activate(context: ServerPluginContext<DocPluginState>): Promise<void> {
    this.context = context

    this.context.registerProvider(
      'chatStrategy',
      () => new DocChatStrategyProvider()
    )
  }

  deactivate(): void {
    this.context = null
  }
}
