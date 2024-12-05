import { useState } from 'react'
import type { SettingKey, SettingValue } from '@shared/entities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@webview/services/api-client'
import { logAndToastError } from '@webview/utils/common'
import { toast } from 'sonner'

interface UseSettingsOptions {
  autoToastOnSuccess?: boolean
}

export const useSettings = (options?: UseSettingsOptions) => {
  const { autoToastOnSuccess = true } = options || {}
  const queryClient = useQueryClient()
  const [loadingMap, setLoadingMap] = useState<Record<SettingKey, boolean>>(
    {} as Record<SettingKey, boolean>
  )

  const { data: settings = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.getMergedSettings({})
  })

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      api.settings.setSettings({ settings: { [key]: value } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  const getSetting = <K extends SettingKey>(key: K): SettingValue<K> =>
    settings[key]

  const setSetting = async (key: string, value: any): Promise<void> => {
    setLoadingMap(prev => ({ ...prev, [key]: true }))
    try {
      await updateSettingMutation.mutateAsync({ key, value })
      autoToastOnSuccess && toast.success('Setting updated successfully')
    } catch (error) {
      logAndToastError('Failed to update setting', error)
      throw error
    } finally {
      setLoadingMap(prev => ({ ...prev, [key]: false }))
    }
  }

  return {
    settings,
    getSetting,
    setSetting,
    loadingMap
  }
}
