import { useState } from 'react'
import { Button } from '@webview/components/ui/button'
import { Progress } from '@webview/components/ui/progress'
import { api } from '@webview/services/api-client'
import type { IndexingProgress } from '@webview/types/chat'
import { logger } from '@webview/utils/logger'

export const CodebaseIndexing = () => {
  const [progress, setProgress] = useState<number>(0)
  const [isIndexing, setIsIndexing] = useState<boolean>(false)

  const handleIndexing = async () => {
    setIsIndexing(true)
    setProgress(0)

    try {
      api.codebase.reindexWorkspace(
        {
          type: 'full'
        },
        (progress: IndexingProgress) => {
          logger.dev.verbose('progress', progress)
          setProgress(
            Math.round((progress.processedFiles / progress.totalFiles) * 100)
          )
        }
      )
    } catch (error) {
      logger.error('Indexing failed:', error)
    } finally {
      setIsIndexing(false)
    }
  }

  return (
    <div>
      <Button onClick={handleIndexing} disabled={isIndexing}>
        {isIndexing ? 'Indexing...' : 'Start Indexing'}
      </Button>
      <Progress value={progress} className="mt-4" />
    </div>
  )
}
