export interface IBaseEntity {
  id: string
  schemaVersion?: number
}

export abstract class BaseEntity<T extends IBaseEntity> {
  constructor(data?: Partial<T>) {
    Object.assign(this, this.getDefaults(), data ?? {})
  }

  abstract getDefaults(): Partial<T>
}
