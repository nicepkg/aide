import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import {
  settingsConfig,
  type SettingCategory,
  type SettingKey,
  type SettingValue
} from '@shared/utils/settings-config'

import { BaseDB, BaseItem } from './base-db'

export interface Settings extends BaseItem {
  key: SettingKey
  value: SettingValue<SettingKey>
  category: SettingCategory
  updatedAt: number
}

class SettingsDB extends BaseDB<Settings> {
  async setSetting<K extends SettingKey>(
    key: K,
    value: SettingValue<K>
  ): Promise<Settings> {
    const existingSettings = await this.getAll()
    const existing = existingSettings.find(s => s.key === key)
    const config = settingsConfig[key]

    if (existing) {
      return this.update(existing.id, {
        value,
        updatedAt: Date.now()
      }) as Promise<Settings>
    }

    return this.add({
      key,
      value,
      category: config.category,
      updatedAt: Date.now()
    })
  }

  async getSetting<K extends SettingKey>(
    key: K
  ): Promise<SettingValue<K> | null> {
    const settings = await this.getAll()
    const setting = settings.find(s => s.key === key)
    return setting
      ? (setting.value as SettingValue<K>)
      : (settingsConfig[key].defaultValue as SettingValue<K>)
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const settings = await this.getAll()
    const defaults = Object.entries(settingsConfig).reduce(
      (acc, [key, config]) => {
        acc[key] = config.defaultValue
        return acc
      },
      {} as Record<string, any>
    )

    const userSettings = settings.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value
        return acc
      },
      {} as Record<string, any>
    )

    return { ...defaults, ...userSettings }
  }

  async getSettingsByCategory(category: SettingCategory): Promise<Settings[]> {
    const settings = await this.getAll()
    return settings.filter(setting => setting.category === category)
  }

  getSettingConfig<K extends SettingKey>(key: K) {
    return settingsConfig[key]
  }

  getAllSettingConfigs() {
    return settingsConfig
  }
}

// Global settings instance
class GlobalSettingsDB extends SettingsDB {
  constructor() {
    super(path.join(aidePaths.getGlobalLowdbPath(), 'global-settings.json'))
  }
}

// Workspace settings instance
class WorkspaceSettingsDB extends SettingsDB {
  constructor() {
    super(
      path.join(aidePaths.getWorkspaceLowdbPath(), 'workspace-settings.json')
    )
  }
}

export const globalSettingsDB = new GlobalSettingsDB()
export const workspaceSettingsDB = new WorkspaceSettingsDB()
