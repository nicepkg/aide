import { useEffect, useState } from 'react'
import { Button } from '@webview/components/ui/button'
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
import { api } from '@webview/services/api-client'
import type { ProgressInfo } from '@webview/types/chat'
import { logger } from '@webview/utils/logger'

interface DocSite {
  id: string
  url: string
}

export const DocManagement = () => {
  const [docSites, setDocSites] = useState<DocSite[]>([])
  const [newSiteUrl, setNewSiteUrl] = useState('')
  const [crawlingProgress, setCrawlingProgress] = useState<
    Record<string, number>
  >({})
  const [indexingProgress, setIndexingProgress] = useState<
    Record<string, number>
  >({})

  useEffect(() => {
    // 加载已保存的doc sites
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

  const handleAddSite = async () => {
    if (!newSiteUrl) return

    try {
      await api.doc.addDocSite({ url: newSiteUrl })
      setNewSiteUrl('')
      loadDocSites()
    } catch (error) {
      logger.error('Failed to add doc site:', error)
    }
  }

  const handleRemoveSite = async (id: string) => {
    try {
      await api.doc.removeDocSite({ id })
      loadDocSites()
    } catch (error) {
      logger.error('Failed to remove doc site:', error)
    }
  }

  const handleCrawl = async (id: string) => {
    setCrawlingProgress(prev => ({ ...prev, [id]: 0 }))

    try {
      await api.doc.crawlDocs({ id }, (progress: ProgressInfo) => {
        setCrawlingProgress(prev => ({
          ...prev,
          [id]: Math.round(
            (progress.processedItems / progress.totalItems) * 100
          )
        }))
      })
    } catch (error) {
      logger.error('Crawling failed:', error)
    } finally {
      setCrawlingProgress(prev => ({ ...prev, [id]: 100 }))
    }
  }

  const handleReindex = async (id: string) => {
    setIndexingProgress(prev => ({ ...prev, [id]: 0 }))

    try {
      await api.doc.reindexDocs({ id }, (progress: ProgressInfo) => {
        setIndexingProgress(prev => ({
          ...prev,
          [id]: Math.round(
            (progress.processedItems / progress.totalItems) * 100
          )
        }))
      })
    } catch (error) {
      logger.error('Reindexing failed:', error)
    } finally {
      setIndexingProgress(prev => ({ ...prev, [id]: 100 }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Enter doc site URL"
          value={newSiteUrl}
          onChange={e => setNewSiteUrl(e.target.value)}
        />
        <Button onClick={handleAddSite}>Add Site</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>URL</TableHead>
            <TableHead>Crawling</TableHead>
            <TableHead>Indexing</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docSites.map(site => (
            <TableRow key={site.id}>
              <TableCell>{site.url}</TableCell>

              <TableCell>
                <div className="flex flex-col gap-2 w-[100px]">
                  <Progress value={crawlingProgress[site.id] || 0} />
                  <Button
                    className="w-auto"
                    size="xs"
                    onClick={() => handleCrawl(site.id)}
                  >
                    Crawl
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2 w-[100px]">
                  <Progress value={indexingProgress[site.id] || 0} />
                  <Button
                    className="w-auto"
                    size="xs"
                    onClick={() => handleReindex(site.id)}
                  >
                    Reindex
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveSite(site.id)}
                    size="xs"
                  >
                    Remove
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
