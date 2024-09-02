import { useEffect, useState } from 'react'
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  LexicalEditor
} from 'lexical'

import { $isMentionNode } from '../nodes/mention-node'

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

          if ($isMentionNode(anchorNode)) {
            setIsOpen(false)
            setSearchQuery('')
            return
          }

          if (!$isTextNode(anchorNode)) {
            setIsOpen(false)
            setSearchQuery('')
            return
          }

          const textContent = anchorNode.getTextContent()
          const anchorOffset = anchor.offset

          // Look for '@' anywhere in the text, but only consider the part before the cursor
          const beforeCursor = textContent.slice(0, anchorOffset)
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
