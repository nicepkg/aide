import { useEffect } from 'react'
import { settingsConfig } from '@shared/entities'
import { Settings } from '@webview/components/settings/settings'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pageId = searchParams.get('pageId')

  useEffect(() => {
    // If page is provided in URL, ensure it exists in config
    if (pageId && typeof pageId === 'string') {
      const isValidPage =
        settingsConfig.pages?.some(p => p.id === pageId) ||
        settingsConfig.groups.some(group =>
          group.pages.some(p => p.id === pageId)
        )

      if (!isValidPage) {
        navigate('/settings', { replace: true })
      }
    }
  }, [pageId, navigate])

  return <Settings initialPageId={pageId} />
}
