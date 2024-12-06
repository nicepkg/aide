import React from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@webview/components/ui/popover'
import { useControllableState } from '@webview/hooks/use-controllable-state'

import { ContentPreview, type PreviewContent } from './content-preview'

interface ContentPreviewPopoverProps {
  content: PreviewContent
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const ContentPreviewPopover: React.FC<ContentPreviewPopoverProps> = ({
  content,
  open,
  onOpenChange,
  children
}) => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: open,
    defaultProp: false,
    onChange: onOpenChange
  })

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
        className="min-w-[200px] max-w-[800px] w-screen max-h-[500px] p-0 border-primary"
        side="top"
        align="start"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <div
          className="w-full bg-background overflow-auto"
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
          <ContentPreview content={content} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
