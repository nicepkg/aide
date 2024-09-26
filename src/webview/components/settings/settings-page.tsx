import { Settings } from './settings'
import { settingsConfig } from './settings-config'

export const SettingsPage = () => {
  const handleSettingChange = (key: string, value: any) => {
    console.log(`Setting ${key} changed to:`, value)
  }

  return <Settings config={settingsConfig} onChange={handleSettingChange} />
}
