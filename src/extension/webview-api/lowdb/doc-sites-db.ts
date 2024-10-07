import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'

import { BaseDB, BaseItem } from './base-db'

export interface DocSite extends BaseItem {
  name: string
  url: string
  isCrawled: boolean
  isIndexed: boolean
}

class DocSitesDB extends BaseDB<DocSite> {
  constructor() {
    super(path.join(aidePaths.getGlobalLowdbPath(), 'doc-sites.json'))
  }

  async add(
    item: Omit<DocSite, 'id' | 'isCrawled' | 'isIndexed'>
  ): Promise<DocSite> {
    return super.add({
      ...item,
      isCrawled: false,
      isIndexed: false
    })
  }

  async updateStatus(
    id: string,
    updates: { isCrawled?: boolean; isIndexed?: boolean }
  ): Promise<DocSite | null> {
    return this.update(id, updates)
  }
}

export const docSitesDB = new DocSitesDB()
