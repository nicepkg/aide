import type { FC } from 'react'
import type { SvgComponent } from '@webview/types/common'
import { cn } from '@webview/utils/common'
import {
  getIconComponent,
  type GetIconComponentProps
} from '@webview/utils/file-icons/utils'

export interface FileIconProps
  extends Omit<GetIconComponentProps, 'name'>,
    Omit<React.ComponentProps<SvgComponent>, 'name'> {
  filePath: string
}

export const FileIcon: FC<FileIconProps> = props => {
  const { isFolder, isOpen, filePath, className, ...otherProps } = props
  const MaterialSvgComponent = getIconComponent({
    isFolder,
    isOpen,
    name: filePath
  })

  if (!MaterialSvgComponent) return null

  return (
    <MaterialSvgComponent
      className={cn('shrink-0 size-4 text-primary', className)}
      {...otherProps}
    />
  )
}
