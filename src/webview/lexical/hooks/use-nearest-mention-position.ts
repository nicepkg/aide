import { useLayoutEffect, useState } from 'react'
import type { LexicalEditor } from 'lexical'
import { $getSelection, $isRangeSelection, $isTextNode } from 'lexical'

interface Position {
  top: number
  left: number
}

export const useNearestMentionPosition = (editor: LexicalEditor) => {
  const [mentionPosition, setMentionPosition] = useState<Position | null>(null)

  const updateMentionPosition = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        setMentionPosition(null)
        return
      }

      const { anchor } = selection
      const anchorNode = anchor.getNode()

      if (!$isTextNode(anchorNode)) {
        setMentionPosition(null)
        return
      }

      const textContent = anchorNode.getTextContent()
      const anchorOffset = anchor.offset

      const lastAtIndex = textContent.lastIndexOf('@', anchorOffset - 1)
      if (lastAtIndex === -1) {
        setMentionPosition(null)
        return
      }

      // Use window.getSelection() instead of directly manipulating DOM
      const domSelection = window.getSelection()
      if (!domSelection || domSelection.rangeCount === 0) {
        setMentionPosition(null)
        return
      }

      const range = domSelection.getRangeAt(0).cloneRange()
      range.setStart(range.startContainer, lastAtIndex)
      range.setEnd(range.startContainer, lastAtIndex + 1)

      const rect = range.getBoundingClientRect()

      if (rect.top === 0 && rect.left === 0) {
        return
      }

      // Consider any potential iframe offset
      let iframeOffset = { top: 0, left: 0 }
      const editableElement = editor.getRootElement()
      if (editableElement) {
        const iframe = editableElement.closest('iframe')
        if (iframe) {
          const iframeRect = iframe.getBoundingClientRect()
          iframeOffset = { top: iframeRect.top, left: iframeRect.left }
        }
      }

      setMentionPosition({
        top: rect.top + iframeOffset.top,
        left: rect.left + iframeOffset.left
      })
    })
  }

  useLayoutEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(() => {
      updateMentionPosition()
    })

    // Initial position update
    updateMentionPosition()

    return () => {
      removeUpdateListener()
    }
  }, [editor, updateMentionPosition])

  return mentionPosition
}
