import { settingKeyItemConfigMap } from '@shared/entities'
import type {
  SettingKey,
  SettingsSaveType,
  SettingValue
} from '@shared/entities'

import { globalSettingsDB, workspaceSettingsDB } from '../lowdb/settings-db'
import { Controller } from '../types'

export class SettingsController extends Controller {
  readonly name = 'settings'

  async getGlobalSetting<K extends SettingKey>(req: {
    key: K
  }): Promise<SettingValue<K> | null> {
    return await globalSettingsDB.getSetting(req.key)
  }

  async setGlobalSetting<K extends SettingKey>(req: {
    key: K
    value: SettingValue<K>
  }): Promise<void> {
    await globalSettingsDB.setSetting(req.key, req.value)
  }

  async getAllGlobalSettings(): Promise<Record<string, any>> {
    return await globalSettingsDB.getAllSettings()
  }

  async getWorkspaceSetting<K extends SettingKey>(req: {
    key: K
  }): Promise<SettingValue<K> | null> {
    return await workspaceSettingsDB.getSetting(req.key)
  }

  async setWorkspaceSetting<K extends SettingKey>(req: {
    key: K
    value: SettingValue<K>
  }): Promise<void> {
    await workspaceSettingsDB.setSetting(req.key, req.value)
  }

  async getAllWorkspaceSettings(): Promise<Record<string, any>> {
    return await workspaceSettingsDB.getAllSettings()
  }

  async setGlobalSettings(req: {
    settings: Partial<Record<SettingKey, SettingValue<SettingKey>>>
  }): Promise<void> {
    const { settings } = req
    for (const [key, value] of Object.entries(settings)) {
      await globalSettingsDB.setSetting(key as SettingKey, value)
    }
  }

  async setWorkspaceSettings(req: {
    settings: Partial<Record<SettingKey, SettingValue<SettingKey>>>
  }): Promise<void> {
    const { settings } = req
    for (const [key, value] of Object.entries(settings)) {
      await workspaceSettingsDB.setSetting(key as SettingKey, value)
    }
  }

  private async getSaveType(key: SettingKey): Promise<SettingsSaveType> {
    return settingKeyItemConfigMap[key].saveType
  }

  async getSetting(req: {
    key: SettingKey
  }): Promise<SettingValue<SettingKey> | null> {
    const saveType = await this.getSaveType(req.key)
    return saveType === 'global'
      ? await globalSettingsDB.getSetting(req.key)
      : await workspaceSettingsDB.getSetting(req.key)
  }

  async setSettings(req: {
    settings: Partial<Record<SettingKey, SettingValue<SettingKey>>>
  }): Promise<void> {
    const { settings } = req
    for (const [key, value] of Object.entries(settings)) {
      const saveType = await this.getSaveType(key as SettingKey)
      if (saveType === 'global') {
        await globalSettingsDB.setSetting(key as SettingKey, value)
      } else {
        await workspaceSettingsDB.setSetting(key as SettingKey, value)
      }
    }
  }

  async getMergedSettings(): Promise<Record<string, any>> {
    const globalSettings = await globalSettingsDB.getAllSettings()
    const workspaceSettings = await workspaceSettingsDB.getAllSettings()

    return {
      ...globalSettings,
      ...workspaceSettings // Workspace settings take precedence
    }
  }
}
