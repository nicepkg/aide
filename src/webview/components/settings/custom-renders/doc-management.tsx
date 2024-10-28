import { useEffect, useState } from 'react'
import {
  ExternalLinkIcon,
  Pencil2Icon,
  PlusIcon,
  ReloadIcon,
  TrashIcon
} from '@radix-ui/react-icons'
import { Button } from '@webview/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@webview/components/ui/dialog'
import { Input } from '@webview/components/ui/input'
import { Progress } from '@webview/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@webview/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@webview/components/ui/tooltip'
import { api } from '@webview/services/api-client'
import type { ProgressInfo } from '@webview/types/chat'
import { logAndToastError } from '@webview/utils/common'
import { logger } from '@webview/utils/logger'
import { toast } from 'sonner'

interface DocSite {
  id: string
  name: string
  url: string
  isCrawled: boolean
  isIndexed: boolean
}

export const DocManagement = () => {
  const [docSites, setDocSites] = useState<DocSite[]>([])
  const [siteName, setSiteName] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null)
  const [crawlingProgress, setCrawlingProgress] = useState<
    Record<string, number>
  >({})
  const [indexingProgress, setIndexingProgress] = useState<
    Record<string, number>
  >({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadDocSites()
  }, [])

  const loadDocSites = async () => {
    try {
      const sites = await api.doc.getDocSites({})
      setDocSites(sites)
    } catch (error) {
      logger.error('Failed to load doc sites:', error)
    }
  }

  const handleSaveSite = async () => {
    if (!siteName || !siteUrl) return
    toggleLoading('save', true)
    try {
      if (editingSiteId) {
        await api.doc.updateDocSite({
          id: editingSiteId,
          name: siteName,
          url: siteUrl
        })
        toast.success('Doc site updated successfully')
      } else {
        await api.doc.addDocSite({
          name: siteName,
          url: siteUrl
        })
        toast.success('New doc site added successfully')
      }
      clearSiteFields()
      await loadDocSites()
      setIsDialogOpen(false)
    } catch (error) {
      logAndToastError('Failed to save doc site', error)
    } finally {
      toggleLoading('save', false)
    }
  }

  const handleEditSite = (site: DocSite) => {
    setEditingSiteId(site.id)
    setSiteName(site.name)
    setSiteUrl(site.url)
    setIsDialogOpen(true)
  }

  const handleRemoveSite = async (id: string) => {
    try {
      await api.doc.removeDocSite({ id })
      loadDocSites()
      toast.success('Doc site removed successfully')
    } catch (error) {
      logAndToastError('Failed to remove doc site', error)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query) {
      const results = await api.doc.searchDocSites(query)
      setDocSites(results)
    } else {
      loadDocSites()
    }
  }

  const handleCrawl = async (id: string) => {
    if (loading[id]) return
    toggleLoading(id, true)
    setCrawlingProgress(prev => ({ ...prev, [id]: 0 }))
    try {
      await api.doc.crawlDocs({ id }, (progress: ProgressInfo) =>
        updateProgress(progress, id, setCrawlingProgress)
      )
      toast.success('Document crawling completed')
    } catch (error) {
      logAndToastError('Crawling failed', error)
    } finally {
      toggleLoading(id, false)
      loadDocSites()
    }
  }

  const handleReindex = async (id: string) => {
    if (loading[id]) return
    toggleLoading(id, true)
    setIndexingProgress(prev => ({ ...prev, [id]: 0 }))
    try {
      await api.doc.reindexDocs({ id }, (progress: ProgressInfo) =>
        updateProgress(progress, id, setIndexingProgress)
      )
      toast.success('Document reindexing completed')
    } catch (error) {
      logAndToastError('Reindexing failed', error)
    } finally {
      toggleLoading(id, false)
      loadDocSites()
    }
  }

  const toggleLoading = (key: string, state: boolean) => {
    setLoading(prev => ({ ...prev, [key]: state }))
  }

  const clearSiteFields = () => {
    setSiteName('')
    setSiteUrl('')
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

  const renderSiteRow = (site: DocSite) => (
    <TableRow
      key={site.id}
      className="md:table-row gap-2 p-2 md:gap-0 md:p-0 flex flex-col mb-2 border rounded-lg md:mb-0 md:border-none text-xs"
    >
      {renderTableCell('Name:', site.name)}
      {renderUrlCell(site)}
      {renderProgressCell(
        'Crawling:',
        site,
        crawlingProgress,
        handleCrawl,
        site.isCrawled
      )}
      {renderProgressCell(
        'Indexing:',
        site,
        indexingProgress,
        handleReindex,
        site.isIndexed
      )}
      {renderActionCell(site)}
    </TableRow>
  )

  const renderTableCell = (label: string, content: string) => (
    <TableCell className="md:table-cell block py-1 md:py-2">
      <div className="md:hidden font-bold mr-2">{label}</div>
      {content}
    </TableCell>
  )

  const renderUrlCell = (site: DocSite) => (
    <TableCell className="md:table-cell block py-1 md:py-2">
      <div className="md:hidden font-bold mr-2">URL:</div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="link"
            className="p-0 h-auto text-xs"
            onClick={() => window.open(site.url, '_blank')}
          >
            <div className="truncate max-w-[150px] inline-block align-middle">
              {site.url}
            </div>
            <ExternalLinkIcon className="h-3 w-3 ml-1 inline" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{site.url}</TooltipContent>
      </Tooltip>
    </TableCell>
  )

  const renderProgressCell = (
    label: string,
    site: DocSite,
    progress: Record<string, number>,
    handler: (id: string) => Promise<void>,
    isCompleted: boolean
  ) => (
    <TableCell className="md:table-cell block py-1 md:py-2">
      <div className="md:hidden font-bold mr-2 mb-2">{label}</div>
      <div className="flex flex-col gap-1 w-full md:w-[80px]">
        <Progress value={progress[site.id] || 0} className="h-1 my-1" />
        <Button
          className="w-full md:w-auto text-xs h-6"
          size="sm"
          onClick={() => handler(site.id)}
          disabled={loading[site.id]}
        >
          {loading[site.id] && (
            <ReloadIcon className="mr-1 h-3 w-3 animate-spin" />
          )}
          {isCompleted
            ? label === 'Crawling:'
              ? 'Crawled'
              : 'Indexed'
            : label === 'Crawling:'
              ? 'Crawl'
              : 'Index'}
        </Button>
      </div>
    </TableCell>
  )

  const renderActionCell = (site: DocSite) => (
    <TableCell className="md:table-cell block py-1 md:py-2">
      <div className="md:hidden font-bold mr-2 mb-2">Actions:</div>
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={() => handleEditSite(site)}
          size="sm"
          disabled={loading[site.id]}
          className="w-full md:w-auto text-xs h-6"
        >
          <Pencil2Icon className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleRemoveSite(site.id)}
          size="sm"
          disabled={loading[site.id]}
          className="w-full md:w-auto text-xs h-6"
        >
          <TrashIcon className="h-3 w-3 mr-1" />
          Remove
        </Button>
      </div>
    </TableCell>
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-col mb-4 sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 gap-2">
        <Input
          placeholder="Search doc sites..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          className="text-xs h-6"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingSiteId(null)
                clearSiteFields()
              }}
              className="sm:w-auto text-xs h-6"
              size="sm"
            >
              <PlusIcon className="h-3 w-3 mr-1" />
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-2rem)] rounded-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSiteId ? 'Edit Doc Site' : 'Add New Doc Site'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Enter doc site name"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Enter doc site URL"
                value={siteUrl}
                onChange={e => setSiteUrl(e.target.value)}
                className="text-sm"
              />
              <Button
                onClick={handleSaveSite}
                disabled={loading.save}
                className="w-full text-sm"
              >
                {loading.save && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingSiteId ? 'Update Site' : 'Add Site'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader className="hidden md:table-header-group">
          <TableRow>
            <TableHead className="text-xs py-1">Name</TableHead>
            <TableHead className="text-xs py-1">URL</TableHead>
            <TableHead className="text-xs py-1">Crawling</TableHead>
            <TableHead className="text-xs py-1">Indexing</TableHead>
            <TableHead className="text-xs py-1">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docSites.map(renderSiteRow)}
          <TableRow />
        </TableBody>
      </Table>
    </div>
  )
}
