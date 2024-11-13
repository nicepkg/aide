import { FC } from 'react'
import type { ConversationLog } from '@shared/entities'
import { PluginId } from '@shared/plugins/base/types'
import { ChatLogPreview } from '@webview/components/chat/messages/roles/chat-log-preview'
import { FileIcon } from '@webview/components/file-icon'
import { TruncateStart } from '@webview/components/truncate-start'
import { api } from '@webview/services/api-client'
import { cn } from '@webview/utils/common'
import { getFileNameFromPath } from '@webview/utils/path'

import type { CodeSnippet, FsPluginLog } from '../types'

export const FsLogPreview: FC<{
  log: ConversationLog
}> = props => {
  if (props.log.pluginId !== PluginId.Fs) return null
  const log = props.log as FsPluginLog

  return (
    <ChatLogPreview log={log}>
      <div className="mt-2 space-y-1.5">
        {log.codeSnippets?.map((snippet, index) => (
          <FileSnippetItem key={index} snippet={snippet} />
        ))}
      </div>
    </ChatLogPreview>
  )
}

interface FileSnippetItemProps {
  snippet: CodeSnippet
}

const FileSnippetItem: FC<FileSnippetItemProps> = ({ snippet }) => {
  const openFileInEditor = async () => {
    const fileFullPath = snippet.fullPath

    if (!fileFullPath) return
    await api.file.openFileInEditor({
      path: fileFullPath,
      startLine: snippet.startLine
    })
  }

  const fileName = getFileNameFromPath(snippet.relativePath)

  return (
    <div
      className={cn(
        'w-full cursor-pointer text-sm flex items-center gap-2 hover:bg-border select-none'
      )}
      onClick={openFileInEditor}
    >
      <div className="flex flex-shrink-0 items-center gap-2">
        <FileIcon className="size-4" filePath={snippet.fullPath} />
        <span>{fileName}</span>
      </div>
      <TruncateStart className="text-muted-foreground">
        {snippet.relativePath}
      </TruncateStart>
    </div>
  )
}
