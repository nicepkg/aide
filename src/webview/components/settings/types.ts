import type { SettingsSaveType } from '@shared/utils/settings-config'

export interface SettingItem {
  saveType: SettingsSaveType
  key: string
  label: string
  description: string
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'array'
    | 'object'
    | 'select'
    | 'custom'
  options?: { label: string; value: any }[]
  defaultValue?: any
  customRenderer?: () => React.ReactNode
}

export interface SettingCategory {
  id: string
  label: string
  settings?: SettingItem[]
  customRenderer?: () => React.ReactNode
}

export interface SettingGroup {
  id: string
  label: string
  categories: SettingCategory[]
  expanded?: boolean
}

export interface SettingsConfig {
  title: string
  groups: SettingGroup[]
  categories: SettingCategory[]
}
