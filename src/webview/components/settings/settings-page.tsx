import { useEffect } from 'react'
import type { SettingsSaveType } from '@shared/entities'
import { api } from '@webview/services/api-client'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Settings } from './settings'
import { settingsConfig } from './settings-config'

export const SettingsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category')

  useEffect(() => {
    // If category is provided in URL, ensure it exists in config
    if (category && typeof category === 'string') {
      const isValidCategory =
        settingsConfig.categories.some(c => c.id === category) ||
        settingsConfig.groups.some(group =>
          group.categories.some(c => c.id === category)
        )

      if (!isValidCategory) {
        navigate('/settings', { replace: true })
      }
    }
  }, [category, navigate])

  const handleRemoteChange = async (
    key: string,
    value: any,
    saveType: SettingsSaveType
  ) => {
    const _key = key as any
    if (saveType === 'global') {
      await api.settings.setGlobalSetting({ key: _key, value })
    } else {
      await api.settings.setWorkspaceSetting({ key: _key, value })
    }
  }

  return (
    <Settings
      config={settingsConfig}
      onRemoteChange={handleRemoteChange}
      initialCategory={category as string}
    />
  )
}
