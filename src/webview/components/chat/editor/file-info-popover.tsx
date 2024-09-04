import React from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@webview/components/ui/popover'
import { useControllableState } from '@webview/hooks/use-controllable-state'
import { FileInfo } from '@webview/types/chat'
import { getFileNameFromPath } from '@webview/utils/common'

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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0"
        side="top"
        align="start"
        onCloseAutoFocus={e => e.preventDefault()}
      >
        <div className="p-4">
          <h3 className="font-bold mb-2">
            {getFileNameFromPath(file.fullPath)}
          </h3>
          <p>Path: {file.fullPath}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
