import * as React from 'react'

import { Image, ImageProps } from './image'

export interface ImageGalleryProps {
  enable?: boolean
  items?: string[]
  preview?: ImageProps['preview'] & {
    toolbarAddon?: React.ReactNode
  }
  children?: React.ReactNode
}

export const ImageGallery: React.FC<
  ImageGalleryProps & { ref?: React.Ref<HTMLDivElement> }
> = ({ enable = true, items, preview, children, ref }) => {
  if (!enable) return children

  return (
    <div className="relative">
      {children}
      <div ref={ref} className="flex flex-wrap gap-4">
        {items?.map((src, index) => (
          <Image key={index} src={src} preview={preview} />
        ))}
      </div>
    </div>
  )
}
ImageGallery.displayName = 'ImageGallery'
