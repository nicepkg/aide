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
          // const mentionMatch = beforeCursor.match(/(^|\s|@\w+\s)@(\w*)$/)
          const mentionMatch = beforeCursor.match(/(^|\s|@[^\s]+\s)@([^\s]*)$/u)

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

  const clearMentionInput = () => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const { anchor } = selection
      const anchorNode = anchor.getNode()

      if (!$isTextNode(anchorNode)) return

      const textContent = anchorNode.getTextContent()
      const anchorOffset = anchor.offset

      // Find the position of the last '@' before the cursor
      const lastAtIndex = textContent.lastIndexOf('@', anchorOffset - 1)
      if (lastAtIndex === -1) return

      // Remove the text between '@' and the cursor, but keep the '@'
      anchorNode.spliceText(lastAtIndex + 1, anchorOffset - lastAtIndex - 1, '')

      // Move the selection just after the '@'
      const newPosition = lastAtIndex + 1
      selection.anchor.set(anchorNode.getKey(), newPosition, 'text')
      selection.focus.set(anchorNode.getKey(), newPosition, 'text')
    })
  }

  return { searchQuery, setSearchQuery, clearMentionInput }
}
