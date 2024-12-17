import { useEffect, useRef } from 'react'
import { settledPromiseResults } from '@shared/utils/common'
import { api } from '@webview/services/api-client'
import type { FileInfo } from '@webview/types/chat'
import { noop } from 'es-toolkit'
import { type LexicalEditor } from 'lexical'

interface UseDropHandlerOptions {
  editor: LexicalEditor
  onDropFiles?: (files: FileInfo[]) => void
}

export const useDropHandler = ({
  editor,
  onDropFiles
}: UseDropHandlerOptions) => {
  // Track if we're currently dragging
  const isDraggingRef = useRef(false)

  useEffect(() => {
    const rootElement = editor.getRootElement()
    if (!rootElement) return

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      isDraggingRef.current = true
      rootElement.classList.add('dragging')
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      isDraggingRef.current = false
      rootElement.classList.remove('dragging')
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      isDraggingRef.current = false
      rootElement.classList.remove('dragging')

      // Handle VSCode file drops
      const fileFullPaths = await settledPromiseResults(
        Array.from(e.dataTransfer?.items || [])
          .filter(
            item => item.kind === 'string' && item.type === 'text/uri-list'
          )
          .map(
            item =>
              new Promise<string>(resolve => {
                item.getAsString(uri => {
                  // Convert VSCode URI to file path
                  const fileFullPath = decodeURIComponent(
                    uri.replace('file://', '')
                  )
                  resolve(fileFullPath)
                })
              })
          )
      )

      const droppedFiles = await api.file.traverseWorkspaceFiles(
        { filesOrFolders: fileFullPaths },
        noop
      )

      if (droppedFiles.length > 0) {
        onDropFiles?.(droppedFiles)
      }
    }

    rootElement.addEventListener('dragenter', handleDragEnter)
    rootElement.addEventListener('dragleave', handleDragLeave)
    rootElement.addEventListener('dragover', handleDragOver)
    rootElement.addEventListener('drop', handleDrop)

    return () => {
      rootElement.removeEventListener('dragenter', handleDragEnter)
      rootElement.removeEventListener('dragleave', handleDragLeave)
      rootElement.removeEventListener('dragover', handleDragOver)
      rootElement.removeEventListener('drop', handleDrop)
    }
  }, [editor, onDropFiles])
}
