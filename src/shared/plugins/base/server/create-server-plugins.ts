import { DocServerPlugin } from '@shared/plugins/doc-plugin/server/doc-server-plugin'
import { FsServerPlugin } from '@shared/plugins/fs-plugin/server/fs-server-plugin'
import { GitServerPlugin } from '@shared/plugins/git-plugin/server/git-server-plugin'
import { WebServerPlugin } from '@shared/plugins/web-plugin/server/web-server-plugin'

import type { ServerPlugin } from './server-plugin-context'

export const createServerPlugins = (): ServerPlugin[] => {
  const plugins: ServerPlugin[] = [
    new FsServerPlugin(),
    new DocServerPlugin(),
    new WebServerPlugin(),
    new GitServerPlugin()
  ]

  return plugins
}
