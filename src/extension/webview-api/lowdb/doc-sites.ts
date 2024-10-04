import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

interface DocSite {
  id: string
  url: string
}

interface DocSitesData {
  sites: DocSite[]
}

class DocSitesDB {
  private db: Low<DocSitesData>

  constructor() {
    const file = path.join(aidePaths.getGlobalLowdbPath(), 'doc-sites.json')
    const adapter = new JSONFile<DocSitesData>(file)
    this.db = new Low(adapter, { sites: [] })
  }

  async load() {
    await this.db.read()
    this.db.data ||= { sites: [] }
  }

  async getAll(): Promise<DocSite[]> {
    await this.load()
    return this.db.data.sites
  }

  async add(url: string): Promise<DocSite> {
    await this.load()
    const newSite: DocSite = { id: Date.now().toString(), url }
    this.db.data.sites.push(newSite)
    await this.db.write()
    return newSite
  }

  async remove(id: string): Promise<void> {
    await this.load()
    this.db.data.sites = this.db.data.sites.filter(site => site.id !== id)
    await this.db.write()
  }

  async update(id: string, url: string): Promise<DocSite | null> {
    await this.load()
    const site = this.db.data.sites.find(s => s.id === id)
    if (site) {
      site.url = url
      await this.db.write()
      return site
    }
    return null
  }
}

export const docSitesDB = new DocSitesDB()
