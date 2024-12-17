import { FC, type ReactNode } from 'react'
import {
  codebaseSearchAgentName,
  fsVisitAgentName
} from '@shared/plugins/agents/agent-names'
import type { CodebaseSearchAgent } from '@shared/plugins/agents/codebase-search-agent'
import type { FsVisitAgent } from '@shared/plugins/agents/fs-visit-agent'
import type { CustomRenderLogPreviewProps } from '@shared/plugins/base/client/client-plugin-types'
import type { GetAgent } from '@shared/plugins/base/strategies'
import { ChatLogPreview } from '@webview/components/chat/messages/roles/chat-log-preview'
import { FileIcon } from '@webview/components/file-icon'
import { TruncateStart } from '@webview/components/truncate-start'
import { api } from '@webview/services/api-client'
import type { FileInfo } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { getFileNameFromPath } from '@webview/utils/path'

import type { CodeSnippet } from '../types'

export const FsLogPreview: FC<CustomRenderLogPreviewProps> = props => {
  const { log } = props
  const { agent } = log

  const renderWrapper = (children: ReactNode) => (
    <ChatLogPreview log={log}>
      <div className="mt-2 space-y-1.5">{children}</div>
    </ChatLogPreview>
  )

  if (!agent) return null

  switch (agent.name) {
    case codebaseSearchAgentName:
      return renderWrapper(
        <div className="mt-2 space-y-1.5">
          {(agent as GetAgent<CodebaseSearchAgent>).output.codeSnippets?.map(
            (snippet, index) => <FileSnippetItem key={index} file={snippet} />
          )}
        </div>
      )
    case fsVisitAgentName:
      return renderWrapper(
        <div className="mt-2 space-y-1.5">
          {(agent as GetAgent<FsVisitAgent>).output.files?.map(
            (file, index) => <FileSnippetItem key={index} file={file} />
          )}
        </div>
      )
    default:
      return null
  }
}

interface FileSnippetItemProps {
  file: CodeSnippet | FileInfo
}

const FileSnippetItem: FC<FileSnippetItemProps> = ({ file }) => {
  const openFileInEditor = async () => {
    const fileFullPath = file.fullPath

    if (!fileFullPath) return
    await api.file.openFileInEditor({
      path: fileFullPath,
      startLine: 'startLine' in file ? file.startLine : undefined
    })
  }

  const fileName = getFileNameFromPath(file.relativePath)

  return (
    <div
      className={cn(
        'w-full cursor-pointer text-sm flex items-center gap-2 hover:bg-border select-none'
      )}
      onClick={openFileInEditor}
    >
      <div className="flex flex-shrink-0 items-center gap-2">
        <FileIcon className="size-4" filePath={file.fullPath} />
        <span>{fileName}</span>
      </div>
      <TruncateStart className="text-muted-foreground">
        {file.relativePath}
      </TruncateStart>
    </div>
  )
}
