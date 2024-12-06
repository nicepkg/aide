import React, { useEffect, useRef, useState } from 'react'
import { Cross1Icon, PlusIcon } from '@radix-ui/react-icons'
import { ButtonWithTooltip } from '@webview/components/button-with-tooltip'
import { FileIcon } from '@webview/components/file-icon'
import { Button } from '@webview/components/ui/button'
import type { FileInfo } from '@webview/types/chat'
import { cn } from '@webview/utils/common'
import { getFileNameFromPath } from '@webview/utils/path'

import { ContentPreviewPopover } from '../../content-preview-popover'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { FileSelector } from '../selectors/file-selector'

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
  const [showMore, setShowMore] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(3)

  // Check if content overflows
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const checkOverflow = () => {
      setShowMore(container.scrollHeight > container.clientHeight)
      const items = container.querySelectorAll('.file-item')
      let count = 0
      for (const item of items) {
        if (item.getBoundingClientRect().top < container.clientHeight) {
          count++
        }
      }
      setVisibleCount(count)
    }

    checkOverflow()
    const resizeObserver = new ResizeObserver(checkOverflow)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [selectedFiles])

  const handleRemoveFile = (file: FileInfo) => {
    onSelectedFilesChange(
      selectedFiles.filter(f => f.fullPath !== file.fullPath)
    )
  }

  const renderFileItem = (file: FileInfo) => (
    <ContentPreviewPopover
      key={file.fullPath}
      content={{ type: 'file', path: file.fullPath }}
    >
      <div className="file-item cursor-pointer flex items-center border text-foreground bg-background mr-2 mt-2 h-5 px-1 py-0.5 text-xs rounded-sm">
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
    </ContentPreviewPopover>
  )

  return (
    <div
      className={cn(
        'chat-input-file-attachments relative flex flex-wrap items-center max-h-[56px] overflow-hidden',
        className
      )}
      ref={containerRef}
    >
      {showFileSelector && (
        <FileSelector
          onChange={onSelectedFilesChange}
          selectedFiles={selectedFiles}
          onOpenChange={isOpen => onOpenChange?.(isOpen)}
        >
          <ButtonWithTooltip
            variant="outline"
            size="xsss"
            className="file-selector-button mr-2 mt-2 self-start"
            tooltip="Add files"
          >
            <PlusIcon className="size-2.5 mr-1" />
            Files
          </ButtonWithTooltip>
        </FileSelector>
      )}

      {showMore && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="xsss"
              className="cursor-pointer mt-2 mr-2 self-start"
            >
              ...{selectedFiles.length - visibleCount} more
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] max-h-[400px] overflow-y-auto p-2">
            <div className="flex flex-wrap gap-1">
              {selectedFiles.map(renderFileItem)}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {selectedFiles.map(renderFileItem)}
    </div>
  )
}
