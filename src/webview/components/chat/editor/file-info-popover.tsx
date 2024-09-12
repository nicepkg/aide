import React from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@webview/components/ui/popover'
import { useReadFile } from '@webview/hooks/api/use-read-file'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { FileInfo } from '@webview/types/chat'
import { getShikiLanguagesFromPath } from '@webview/utils/shiki'
import ShikiHighlighter from 'react-shiki'

interface FFileInfoPopoverProps {
  file: FileInfo
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const FileInfoPopover: React.FC<FFileInfoPopoverProps> = ({
  file,
  open,
  onOpenChange,
  children
}) => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })

  const { data: fileContent = '' } = useReadFile(file.fullPath)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const allowedKeys = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown'
    ]
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault()
    }
  }

  const preventDefault = (e: React.SyntheticEvent) => {
    e.preventDefault()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="min-w-[200px] max-w-[800px] w-screen max-h-[300px] p-0 border-primary"
        side="top"
        align="start"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <div className="w-full p-4 bg-background overflow-auto">
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={preventDefault}
            onKeyDown={handleKeyDown}
            onCopy={preventDefault}
            onPaste={preventDefault}
            onDragStart={preventDefault}
            onDrop={preventDefault}
            style={{ cursor: 'text' }}
          >
            <ShikiHighlighter
              language={getShikiLanguagesFromPath(file.fullPath)}
              theme="dark-plus"
              addDefaultStyles={false}
            >
              {fileContent}
            </ShikiHighlighter>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
