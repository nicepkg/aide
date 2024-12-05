import type {
  RenderOptionsMap,
  RenderOptionsType,
  SettingsSaveType
} from './render-options'

export interface SettingGroup {
  id: string
  label: string
  pages: SettingPage[]
}

export interface SettingPage {
  id: string
  label: string
  settings: SettingConfigItem[]
  relatedSettings?: SettingConfigItem[]
}

export interface SettingConfig {
  pages?: SettingPage[] // general settings
  groups: SettingGroup[]
}

export interface SettingConfigItem<
  T extends RenderOptionsType = RenderOptionsType
> {
  key: string
  saveType: SettingsSaveType
  renderOptions: RenderOptionsMap[T]
}
