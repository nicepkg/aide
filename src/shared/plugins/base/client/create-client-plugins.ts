import { DocClientPlugin } from '@shared/plugins/doc-plugin/client/doc-client-plugin'
import { FsClientPlugin } from '@shared/plugins/fs-plugin/client/fs-client-plugin'
import { GitClientPlugin } from '@shared/plugins/git-plugin/client/git-client-plugin'
import { TerminalClientPlugin } from '@shared/plugins/terminal-plugin/client/terminal-client-plugin'
import { WebClientPlugin } from '@shared/plugins/web-plugin/client/web-client-plugin'

import type { ClientPlugin } from './use-client-plugin'

export const createClientPlugins = (): ClientPlugin[] => {
  const plugins: ClientPlugin[] = [
    FsClientPlugin,
    DocClientPlugin,
    WebClientPlugin,
    GitClientPlugin,
    TerminalClientPlugin
  ]

  return plugins
}
