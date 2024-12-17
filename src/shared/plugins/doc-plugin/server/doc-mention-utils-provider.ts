import type { ControllerRegister } from '@extension/registers/controller-register'
import type { Mention } from '@shared/entities'
import type { MentionUtilsProvider } from '@shared/plugins/base/server/create-provider-manager'

import { DocMentionType } from '../types'

export class DocMentionUtilsProvider implements MentionUtilsProvider {
  async createRefreshMentionFn(controllerRegister: ControllerRegister) {
    const docSites = await controllerRegister.api('doc').getDocSites()

    // Create a map of doc site names for quick lookup
    const docSiteMap = new Map<string, string>()
    for (const site of docSites) {
      docSiteMap.set(site.name, site.name)
    }

    return (_mention: Mention) => {
      const mention = { ..._mention } as Mention
      switch (mention.type) {
        case DocMentionType.Doc:
          const siteName = docSiteMap.get(mention.data)
          if (siteName) mention.data = siteName
          break
        default:
          break
      }

      return mention
    }
  }
}
