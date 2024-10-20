import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'

export interface BaseItem {
  id: string
}

export class BaseDB<T extends BaseItem> {
  protected db: Low<{ items: T[] }>

  constructor(filePath: string) {
    const adapter = new JSONFile<{ items: T[] }>(filePath)
    this.db = new Low(adapter, { items: [] })
  }

  protected async load() {
    await this.db.read()
    this.db.data ||= { items: [] }
  }

  async getAll(): Promise<T[]> {
    await this.load()
    return this.db.data.items
  }

  async add(item: Omit<T, 'id'> & { id?: string }): Promise<T> {
    await this.load()
    const newItem = { ...item, id: item.id || uuidv4() } as T
    this.db.data.items.push(newItem)
    await this.db.write()
    return newItem
  }

  async remove(id: string): Promise<void> {
    await this.load()
    this.db.data.items = this.db.data.items.filter(item => item.id !== id)
    await this.db.write()
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    await this.load()
    const item = this.db.data.items.find(i => i.id === id)
    if (item) {
      Object.assign(item, updates)
      await this.db.write()
      return item
    }
    return null
  }

  async createOrUpdate(item: T): Promise<T> {
    await this.load()
    const existingItem = this.db.data.items.find(i => i.id === item.id)
    if (existingItem) {
      return (await this.update(item.id, item)) as T
    }
    return this.add(item)
  }
}
