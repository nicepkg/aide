import { useState } from 'react'
import {
  InlineDiffTask,
  InlineDiffTaskState
} from '@extension/registers/inline-diff-register/types'
import { api } from '@webview/services/api-client'
import { logger } from '@webview/utils/logger'
import { toast } from 'sonner'

export const useApplyCode = (
  fileFullPath: string | undefined,
  code: string
) => {
  const [isApplying, setIsApplying] = useState(false)
  const [applyStatus, setApplyStatus] = useState<InlineDiffTaskState>(
    InlineDiffTaskState.Idle
  )
  const [appliedContent, setAppliedContent] = useState('')

  const handleStream = (task: InlineDiffTask) => {
    setAppliedContent(task.replacementContent)
    setApplyStatus(task.state)

    if (task.state === InlineDiffTaskState.Error) {
      toast.error('Failed to apply code')
    }
  }

  const applyCode = async (isReapply = false) => {
    if (!fileFullPath) return
    setIsApplying(true)
    setApplyStatus(InlineDiffTaskState.Applying)
    try {
      await api.apply.applyCode(
        {
          path: fileFullPath,
          code,
          cleanLast: isReapply
        },
        handleStream
      )
    } catch (error) {
      setApplyStatus(InlineDiffTaskState.Error)
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
      setApplyStatus(InlineDiffTaskState.Idle)
      toast.info('Code application cancelled')
    }
  }

  const reapplyCode = () => {
    setApplyStatus(InlineDiffTaskState.Idle)
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
