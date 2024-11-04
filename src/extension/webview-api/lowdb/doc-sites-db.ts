import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import { DocSiteEntity, type DocSite } from '@shared/entities/doc-site-entity'

import { BaseDB } from './base-db'

class DocSitesDB extends BaseDB<DocSite> {
  static readonly schemaVersion = 1

  constructor() {
    const defaults = new DocSiteEntity().entity
    super(
      path.join(aidePaths.getGlobalLowdbPath(), 'doc-sites.json'),
      defaults,
      DocSitesDB.schemaVersion
    )
  }

  async add(
    item: Omit<DocSite, 'id' | 'isCrawled' | 'isIndexed'> & {
      id?: string
    }
  ): Promise<DocSite> {
    const docSite = new DocSiteEntity(item).entity
    return super.add(docSite)
  }

  async batchAdd(
    items: (Omit<DocSite, 'id' | 'isCrawled' | 'isIndexed'> & {
      id?: string
    })[]
  ): Promise<DocSite[]> {
    const docSites = items.map(item => new DocSiteEntity(item).entity)
    return super.batchAdd(docSites)
  }

  async updateStatus(
    id: string,
    updates: { isCrawled?: boolean; isIndexed?: boolean }
  ): Promise<DocSite | null> {
    return this.update(id, updates)
  }
}

export const docSitesDB = new DocSitesDB()
