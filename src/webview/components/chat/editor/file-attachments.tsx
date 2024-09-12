import React from 'react'
import { Cross1Icon, PlusIcon } from '@radix-ui/react-icons'
import { FileIcon } from '@webview/components/file-icon'
import { Button } from '@webview/components/ui/button'
import type { FileInfo } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { getFileNameFromPath } from '@webview/utils/path'

import { FileSelector } from '../selectors/file-selector'
import { FileInfoPopover } from './file-info-popover'

interface FileAttachmentsProps {
  className?: string
  showFileSelector?: boolean
  selectedFiles: FileInfo[]
  onSelectedFilesChange: (files: FileInfo[]) => void
  onOpenChange?: (isOpen: boolean) => void
}

export const FileAttachments: React.FC<FileAttachmentsProps> = ({
  className,
  showFileSelector = true,
  selectedFiles,
  onSelectedFilesChange,
  onOpenChange
}) => {
  const handleRemoveFile = (file: FileInfo) => {
    onSelectedFilesChange(
      selectedFiles.filter(f => f.fullPath !== file.fullPath)
    )
  }

  return (
    <div
      className={cn(
        'chat-input-file-attachments flex flex-wrap items-center',
        className
      )}
    >
      {showFileSelector && (
        <FileSelector
          onChange={onSelectedFilesChange}
          selectedFiles={selectedFiles}
          onOpenChange={isOpen => onOpenChange?.(isOpen)}
        >
          <Button
            variant="outline"
            size="xsss"
            className="mr-2 mt-2 self-start"
          >
            <PlusIcon className="size-2.5 mr-1" />
            Files
          </Button>
        </FileSelector>
      )}

      {selectedFiles.map(file => (
        <FileInfoPopover key={file.fullPath} file={file}>
          <div className="cursor-pointer flex items-center border text-foreground bg-background mr-2 mt-2 h-5 px-1 py-0.5 text-xs rounded-sm">
            <FileIcon className="size-2.5 mr-1" filePath={file.fullPath} />
            <div>{getFileNameFromPath(file.fullPath)}</div>
            <Cross1Icon
              className="size-2.5 ml-1"
              onClick={e => {
                e.stopPropagation()
                handleRemoveFile(file)
              }}
            />
          </div>
        </FileInfoPopover>
      ))}
    </div>
  )
}
