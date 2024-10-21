import { useState } from 'react'
import {
  TmpFileStatus,
  TmpFileYieldedChunk
} from '@extension/file-utils/apply-file/types'
import { api } from '@webview/services/api-client'
import { logger } from '@webview/utils/logger'
import { toast } from 'sonner'

export function useApplyCode(fileFullPath: string | undefined, code: string) {
  const [isApplying, setIsApplying] = useState(false)
  const [applyStatus, setApplyStatus] = useState<TmpFileStatus>(
    TmpFileStatus.IDLE
  )
  const [appliedContent, setAppliedContent] = useState('')

  const handleChunk = (chunk: TmpFileYieldedChunk) => {
    setAppliedContent(chunk.generatedContent)
    setApplyStatus(chunk.status)

    if (chunk.status === TmpFileStatus.ERROR) {
      toast.error('Failed to apply code')
    }
  }

  const applyCode = async (isReapply = false) => {
    if (!fileFullPath) return
    setIsApplying(true)
    setApplyStatus(TmpFileStatus.PROCESSING)
    try {
      await api.apply.applyCode(
        {
          path: fileFullPath,
          code,
          closeCurrentTmpFile: isReapply,
          silentMode: true
        },
        handleChunk
      )
    } catch (error) {
      setApplyStatus(TmpFileStatus.ERROR)
      logger.error('Failed to apply code', error)
      toast.error('Failed to apply code')
    } finally {
      setIsApplying(false)
    }
  }

  const cancelApply = () => {
    if (fileFullPath) {
      api.apply.interruptApplyCode({ path: fileFullPath })
      setIsApplying(false)
      setApplyStatus(TmpFileStatus.IDLE)
      toast.info('Code application cancelled')
    }
  }

  const reapplyCode = () => {
    setApplyStatus(TmpFileStatus.IDLE)
    setAppliedContent('')
    applyCode(true)
  }

  return {
    isApplying,
    applyStatus,
    appliedContent,
    applyCode,
    cancelApply,
    reapplyCode
  }
}
