import * as React from 'react'
import {
  RotateCounterClockwiseIcon,
  ViewHorizontalIcon,
  ViewVerticalIcon,
  ZoomInIcon,
  ZoomOutIcon
} from '@radix-ui/react-icons'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@webview/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@webview/components/ui/dialog'

import { Image, type ImageProps } from './image'

export interface ImagePreviewProps extends ImageProps {
  toolbarAddon?: React.ReactNode
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  toolbarAddon,
  ...otherProps
}) => {
  const [scale, setScale] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [flipX, setFlipX] = React.useState(false)
  const [flipY, setFlipY] = React.useState(false)

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 3))
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.1))
  const handleRotateLeft = () => setRotation(r => r - 90)
  const handleRotateRight = () => setRotation(r => r + 90)
  const handleFlipX = () => setFlipX(f => !f)
  const handleFlipY = () => setFlipY(f => !f)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image {...otherProps} />
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] bg-transparent border-none p-0">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle />
            <DialogDescription />
          </DialogHeader>
        </VisuallyHidden>

        <div className="relative w-full h-full">
          <img
            src={otherProps.src}
            alt={otherProps.alt}
            className="w-full h-full object-contain"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
              transition: 'transform 0.3s ease'
            }}
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-background/80 backdrop-blur-sm rounded-lg p-2">
            <Button size="icon" variant="ghost" onClick={handleFlipX}>
              <ViewVerticalIcon />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleFlipY}>
              <ViewHorizontalIcon />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleRotateLeft}>
              <RotateCounterClockwiseIcon />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleRotateRight}>
              <RotateCounterClockwiseIcon className="-scale-x-100" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleZoomOut}>
              <ZoomOutIcon />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleZoomIn}>
              <ZoomInIcon />
            </Button>
            {toolbarAddon}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
