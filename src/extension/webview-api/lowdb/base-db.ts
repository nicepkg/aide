import type { IBaseEntity } from '@shared/entities/base-entity'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { v4 as uuidv4 } from 'uuid'

export class BaseDB<T extends IBaseEntity> {
  protected db: Low<{ items: T[]; schemaVersion?: number }>

  protected currentVersion: number = 1

  protected defaults: Partial<T> = {}

  constructor(
    filePath: string,
    defaults: Partial<T> = {},
    currentVersion: number = 1
  ) {
    const adapter = new JSONFile<{ items: T[]; schemaVersion?: number }>(
      filePath
    )
    this.db = new Low(adapter, { items: [] })
    this.defaults = defaults
    this.currentVersion = currentVersion
  }

  protected async load() {
    await this.db.read()
    this.db.data ||= { items: [], schemaVersion: this.currentVersion }

    if (this.db.data.schemaVersion !== this.currentVersion) {
      await this.migrateData()
    }

    this.db.data.items = this.db.data.items.map(item => ({
      ...this.defaults,
      ...item
    }))
  }

  protected async migrateData() {
    const currentVersion = this.db.data.schemaVersion || 1

    if (currentVersion < this.currentVersion) {
      for (let v = currentVersion; v < this.currentVersion; v++) {
        await this.applyMigration(v)
      }
    }

    this.db.data.schemaVersion = this.currentVersion
    await this.db.write()
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  protected async applyMigration(fromVersion: number) {
    // Override this method in derived classes to implement specific migrations
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

  async batchAdd(items: (Omit<T, 'id'> & { id?: string })[]): Promise<T[]> {
    await this.load()
    const newItems = items.map(item => ({
      ...item,
      id: item.id || uuidv4()
    })) as T[]
    this.db.data.items.push(...newItems)
    await this.db.write()
    return newItems
  }

  async remove(id: string): Promise<void> {
    await this.load()
    this.db.data.items = this.db.data.items.filter(item => item.id !== id)
    await this.db.write()
  }

  async batchRemove(ids: string[]): Promise<void> {
    await this.load()
    this.db.data.items = this.db.data.items.filter(
      item => !ids.includes(item.id)
    )
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

  async batchUpdate(updates: (Partial<T> & { id: string })[]) {
    await this.load()
    for (const update of updates) {
      await this.update(update.id, update)
    }
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
