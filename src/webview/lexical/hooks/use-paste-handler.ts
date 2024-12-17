import { useEffect, useRef } from 'react'
import { type ImageInfo } from '@shared/entities'
import { logger } from '@webview/utils/logger'
import { type LexicalEditor } from 'lexical'

interface UsePasteHandlerOptions {
  editor: LexicalEditor
  onPasteImage?: (image: ImageInfo) => void
}

/**
 * Hook for handling image paste events in a Lexical editor
 *
 * Handles three types of paste scenarios:
 * 1. HTML content with embedded images
 * 2. Direct file/image pastes
 * 3. Image URLs in plain text
 */
export const usePasteHandler = ({
  editor,
  onPasteImage
}: UsePasteHandlerOptions) => {
  // Use ref to track processed images in current paste event
  const processedImagesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const { clipboardData } = event
      if (!clipboardData) return

      // Clear processed images from previous paste event
      processedImagesRef.current.clear()

      const html = clipboardData.getData('text/html')
      const plainText = clipboardData.getData('text/plain')

      const { items } = clipboardData

      // Helper function to prevent duplicate image processing
      const processImage = (image: ImageInfo) => {
        const imageKey = String(image.url)
        if (!processedImagesRef.current.has(imageKey)) {
          processedImagesRef.current.add(imageKey)
          onPasteImage?.(image)
        }
      }

      // Process HTML content with embedded images
      if (html) {
        const images = imageUtils.extractFromHtml(html)
        images.forEach(processImage)
      }

      // Process clipboard items (direct file/image pastes)
      if (items) {
        let hasImage = false

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            hasImage = true
            const file = item.getAsFile()
            if (!file) continue

            try {
              const image = await imageUtils.processFile(file)
              processImage(image)
            } catch (error) {
              logger.error('Failed to process pasted image:', error)
            }
          }
        }

        // Prevent default only for pure image pastes
        if (hasImage && !plainText && !html) {
          event.preventDefault()
        }
      }

      // Process image URLs in plain text
      if (plainText && imageUtils.isImageUrl(plainText)) {
        processImage(imageUtils.createFromUrl(plainText))
      }
    }

    const rootElement = editor.getRootElement()
    rootElement?.addEventListener('paste', handlePaste)

    return () => {
      rootElement?.removeEventListener('paste', handlePaste)
    }
  }, [editor, onPasteImage])
}

// Constants for image handling
const IMAGE_TYPES = {
  EMBEDDED: 'data:image/',
  REMOTE: 'http'
} as const

const IMAGE_NAMES = {
  EMBEDDED: 'embedded-image',
  WEB: 'web-image',
  PASTED: 'pasted-image'
} as const

const IMAGE_URL_PATTERN = /^https?:\/\/.*\.(png|jpe?g|gif|webp|svg)$/i

/**
 * Utility functions for image handling
 */
const imageUtils = {
  isImageUrl: (text: string): boolean => IMAGE_URL_PATTERN.test(text),

  createFromUrl: (url: string): ImageInfo => ({
    url,
    name: url.split('/').pop() || IMAGE_NAMES.WEB
  }),

  extractFromHtml: (html: string): ImageInfo[] => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    return Array.from(tempDiv.getElementsByTagName('img')).reduce<ImageInfo[]>(
      (images, img) => {
        const { src } = img
        if (!src) return images

        if (src.startsWith(IMAGE_TYPES.EMBEDDED)) {
          images.push({ url: src, name: IMAGE_NAMES.EMBEDDED })
        } else if (src.startsWith(IMAGE_TYPES.REMOTE)) {
          images.push(imageUtils.createFromUrl(src))
        }
        return images
      },
      []
    )
  },

  processFile: async (file: File): Promise<ImageInfo> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => {
        resolve({
          url: e.target?.result as string,
          name: file.name || IMAGE_NAMES.PASTED
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
}
