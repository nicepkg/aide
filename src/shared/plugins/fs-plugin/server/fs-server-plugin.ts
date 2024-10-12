import type {
  ServerPlugin,
  ServerPluginContext
} from '@shared/plugins/base/server/server-plugin-context'
import { PluginId } from '@shared/plugins/base/types'
import { pkg } from '@shared/utils/pkg'

import type { FsPluginState } from '../types'
import { FsChatStrategyProvider } from './chat-strategy/fs-chat-strategy-provider'

export class FsServerPlugin implements ServerPlugin<FsPluginState> {
  id = PluginId.Fs

  version: string = pkg.version

  private context: ServerPluginContext<FsPluginState> | null = null

  async activate(context: ServerPluginContext<FsPluginState>): Promise<void> {
    this.context = context

    this.context.registerProvider(
      'chatStrategy',
      () => new FsChatStrategyProvider()
    )
  }

  deactivate(): void {
    this.context = null
  }
}
