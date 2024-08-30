import { useEffect, useState } from 'react'
import type { LexicalEditor } from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'

export const useMentionSearch = (
  editor: LexicalEditor,
  setIsOpen: (open: boolean) => void
) => {
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection()

          if (!$isRangeSelection(selection)) {
            setIsOpen(false)
            setSearchQuery('')
            return
          }

          const { anchor } = selection
          const anchorNode = anchor.getNode()
          const textContent = anchorNode.getTextContent()
          const focusOffset = selection.focus.offset

          // Check if we're inside a mention node
          if (anchorNode.getType() === 'mention') {
            setIsOpen(false)
            setSearchQuery('')
            return
          }

          // Look for '@' at the start of the line, after a space, or after another mention node
          const beforeCursor = textContent.slice(0, focusOffset)
          const mentionMatch = beforeCursor.match(/(^|\s|@\w+\s)@(\w*)$/)

          if (mentionMatch) {
            setSearchQuery(mentionMatch[2] ?? '')
            setIsOpen(true)
          } else {
            setIsOpen(false)
            setSearchQuery('')
          }
        })
      }
    )

    return () => {
      removeUpdateListener()
    }
  }, [editor, setIsOpen])

  return { searchQuery, setSearchQuery }
}
