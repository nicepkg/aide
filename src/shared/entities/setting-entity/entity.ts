import { v4 as uuidv4 } from 'uuid'

import { BaseEntity, type IBaseEntity } from '../base-entity'
import type { SettingKey, SettingValue } from './setting-config'

export interface Settings extends IBaseEntity {
  key: SettingKey
  value: SettingValue<SettingKey>
  updatedAt: number
}

export class SettingsEntity extends BaseEntity<Settings> {
  protected getDefaults(data?: Partial<Settings>): Settings {
    return {
      id: uuidv4(),
      key: 'unknown' as SettingKey,
      value: 'unknown',
      updatedAt: Date.now(),
      ...data
    }
  }
}
