export interface IBaseEntity {
  id: string
  schemaVersion?: number
}

export abstract class BaseEntity<T extends IBaseEntity> {
  entity: T

  constructor(data?: Partial<T>) {
    this.entity = { ...this.getDefaults(data || {}), ...(data ?? {}) }
  }

  protected abstract getDefaults(data: Partial<T>): T
}
