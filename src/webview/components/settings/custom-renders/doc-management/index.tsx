import { useState } from 'react'
import type { DocSite } from '@shared/entities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CardList } from '@webview/components/ui/card-list'
import { Input } from '@webview/components/ui/input'
import { api } from '@webview/services/api-client'
import type { ProgressInfo } from '@webview/types/chat'
import { logAndToastError } from '@webview/utils/common'
import { toast } from 'sonner'

import { DocSiteCard } from './doc-site-card'
import { DocSiteDialog } from './doc-site-dialog'

// Query key for doc sites
const docSitesQueryKey = ['docSites'] as const

export const DocManagement = () => {
  const queryClient = useQueryClient()
  const [siteName, setSiteName] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null)
  const [crawlingProgress, setCrawlingProgress] = useState<
    Record<string, number>
  >({})
  const [indexingProgress, setIndexingProgress] = useState<
    Record<string, number>
  >({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Queries
  const { data: docSites = [] } = useQuery({
    queryKey: [...docSitesQueryKey, searchQuery],
    queryFn: () =>
      searchQuery
        ? api.doc.searchDocSites(searchQuery)
        : api.doc.getDocSites({})
  })

  // Mutations
  const addSiteMutation = useMutation({
    mutationFn: (data: { name: string; url: string }) =>
      api.doc.addDocSite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docSitesQueryKey })
      toast.success('New doc site added successfully')
      handleCloseDialog()
    },
    onError: error => {
      logAndToastError('Failed to add doc site', error)
    }
  })

  const updateSiteMutation = useMutation({
    mutationFn: (data: { id: string; name: string; url: string }) =>
      api.doc.updateDocSite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docSitesQueryKey })
      toast.success('Doc site updated successfully')
      handleCloseDialog()
    },
    onError: error => {
      logAndToastError('Failed to update doc site', error)
    }
  })

  const removeSitesMutation = useMutation({
    mutationFn: (ids: string[]) => api.doc.removeDocSites({ ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docSitesQueryKey })
      toast.success('Doc site removed successfully')
    },
    onError: error => {
      logAndToastError('Failed to remove doc site', error)
    }
  })

  const crawlSiteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      setCrawlingProgress(prev => ({ ...prev, [id]: 0 }))
      await api.doc.crawlDocs({ id }, (progress: ProgressInfo) =>
        updateProgress(progress, id, setCrawlingProgress)
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docSitesQueryKey })
      toast.success('Document crawling completed')
    },
    onError: error => {
      logAndToastError('Crawling failed', error)
    }
  })

  const reindexSiteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      setIndexingProgress(prev => ({ ...prev, [id]: 0 }))
      await api.doc.reindexDocs({ id }, (progress: ProgressInfo) =>
        updateProgress(progress, id, setIndexingProgress)
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: docSitesQueryKey })
      toast.success('Document reindexing completed')
    },
    onError: error => {
      logAndToastError('Reindexing failed', error)
    }
  })

  const handleSaveSite = async () => {
    if (!siteName || !siteUrl) return

    if (editingSiteId) {
      updateSiteMutation.mutate({
        id: editingSiteId,
        name: siteName,
        url: siteUrl
      })
    } else {
      addSiteMutation.mutate({
        name: siteName,
        url: siteUrl
      })
    }
  }

  const handleEditSite = (site: DocSite) => {
    setEditingSiteId(site.id)
    setSiteName(site.name)
    setSiteUrl(site.url)
    setIsDialogOpen(true)
  }

  const handleOpenDialog = () => {
    clearSiteFields()
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    clearSiteFields()
  }

  const handleRemoveSites = (items: DocSite[]) => {
    removeSitesMutation.mutate(items.map(item => item.id))
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const clearSiteFields = () => {
    setSiteName('')
    setSiteUrl('')
    setEditingSiteId(null)
  }

  const updateProgress = (
    progress: ProgressInfo,
    id: string,
    setProgress: React.Dispatch<React.SetStateAction<Record<string, number>>>
  ) => {
    setProgress(prev => ({
      ...prev,
      [id]: Math.round((progress.processedItems / progress.totalItems) * 100)
    }))
  }

  return (
    <div className="space-y-4">
      {/* <div className="flex items-center gap-2">
        <Input
          placeholder="Search doc sites..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          className="text-xs h-8"
        />
        <Button
          onClick={() => {
            clearSiteFields()
            setIsDialogOpen(true)
          }}
          className="h-8 text-xs"
          size="sm"
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          Add Site
        </Button>
      </div> */}

      <CardList
        items={docSites}
        idField="id"
        draggable={false}
        minCardWidth={300}
        onCreateItem={handleOpenDialog}
        onDeleteItems={handleRemoveSites}
        headerLeftActions={
          <Input
            placeholder="Search doc sites..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="text-xs h-8"
          />
        }
        renderCard={({ item: site, isSelected, onSelect }) => (
          <DocSiteCard
            site={site}
            loading={
              crawlSiteMutation.isPending || reindexSiteMutation.isPending
            }
            crawlingProgress={crawlingProgress[site.id] || 0}
            indexingProgress={indexingProgress[site.id] || 0}
            onEdit={handleEditSite}
            onRemove={() => handleRemoveSites([site])}
            onCrawl={() => crawlSiteMutation.mutate({ id: site.id })}
            onReindex={() => reindexSiteMutation.mutate({ id: site.id })}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        )}
      />

      <DocSiteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        loading={addSiteMutation.isPending || updateSiteMutation.isPending}
        siteName={siteName}
        siteUrl={siteUrl}
        onSiteNameChange={setSiteName}
        onSiteUrlChange={setSiteUrl}
        onSave={handleSaveSite}
        editingSite={
          editingSiteId
            ? docSites.find(site => site.id === editingSiteId)
            : undefined
        }
      />
    </div>
  )
}
