import type {
  ServerPlugin,
  ServerPluginContext
} from '@shared/plugins/base/server/server-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'

import type { WebPluginState } from '../types'
import { WebChatStrategyProvider } from './chat-strategy/web-chat-strategy-provider'

export class WebServerPlugin implements ServerPlugin<WebPluginState> {
  id = PluginId.Web

  version: string = pkg.version

  private context: ServerPluginContext<WebPluginState> | null = null

  async activate(context: ServerPluginContext<WebPluginState>): Promise<void> {
    this.context = context

    this.context.registerProvider(
      'chatStrategy',
      () => new WebChatStrategyProvider()
    )
  }

  deactivate(): void {
    this.context = null
  }
}
