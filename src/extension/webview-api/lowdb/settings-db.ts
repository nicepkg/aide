import path from 'path'
import { aidePaths } from '@extension/file-utils/paths'
import {
  settingKeyItemConfigMap,
  settingsConfig,
  SettingsEntity,
  type SettingKey,
  type Settings,
  type SettingValue
} from '@shared/entities'

import { BaseDB } from './base-db'

class SettingsDB extends BaseDB<Settings> {
  static readonly schemaVersion = 1

  constructor(filePath: string) {
    super(filePath, SettingsDB.schemaVersion)
  }

  getDefaults(): Partial<Settings> {
    return new SettingsEntity().entity
  }

  async setSetting<K extends SettingKey>(
    key: K,
    value: SettingValue<K>
  ): Promise<Settings> {
    const existingSettings = await this.getAll()
    const existing = existingSettings.find(s => s.key === key)

    if (existing) {
      return this.update(existing.id, {
        value,
        updatedAt: Date.now()
      }) as Promise<Settings>
    }

    const setting = new SettingsEntity({
      key,
      value,
      updatedAt: Date.now()
    }).entity

    return this.add(setting)
  }

  async getSetting<K extends SettingKey>(
    key: K
  ): Promise<SettingValue<K> | null> {
    const settings = await this.getAll()
    const setting = settings.find(s => s.key === key)
    return setting
      ? (setting.value as SettingValue<K>)
      : settingKeyItemConfigMap[key].renderOptions.defaultValue
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

  getSettingConfig<K extends SettingKey>(key: K) {
    return settingKeyItemConfigMap[key]
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
