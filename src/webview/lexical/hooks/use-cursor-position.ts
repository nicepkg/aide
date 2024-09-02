import { useCallback, useEffect, useState } from 'react'
import type { LexicalEditor } from 'lexical'

export const useCursorPosition = (editor: LexicalEditor) => {
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 })

  const updateCursorPosition = useCallback(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setCursorPosition({
        top: rect.top,
        left: rect.left
      })
    }
  }, [])

  console.log('useCursorPosition', { ...cursorPosition })

  useEffect(() => {
    const removeTextContentListener = editor.registerUpdateListener(() => {
      updateCursorPosition()
    })

    return () => {
      removeTextContentListener()
    }
  }, [editor, updateCursorPosition])

  return cursorPosition
}
