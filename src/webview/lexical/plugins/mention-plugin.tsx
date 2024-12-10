import React, { useState, type FC } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { MentionSelector } from '@webview/components/chat/selectors/mention-selector/mention-selector'
import { usePluginMentionOptions } from '@webview/hooks/chat/use-plugin-providers'
import type { MentionOption } from '@webview/types/chat'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  type RangeSelection
} from 'lexical'

import { useEditorCommands } from '../hooks/use-editor-commands'
import { useMentionSearch } from '../hooks/use-mention-search'
import { useNearestMentionPosition } from '../hooks/use-nearest-mention-position'
import { $createMentionNode } from '../nodes/mention-node'

export interface MentionPluginProps {}

export const MentionPlugin: FC<MentionPluginProps> = props => {
  const [editor] = useLexicalComposerContext()
  const [isOpen, setIsOpen] = useState(false)
  const mentionPosition = useNearestMentionPosition(editor)
  const mentionOptions = usePluginMentionOptions()

  const { searchQuery, setSearchQuery, clearMentionInput } = useMentionSearch(
    editor,
    setIsOpen
  )

  useEditorCommands(editor, isOpen, setIsOpen)

  const handleMentionSelect = (option: MentionOption) => {
    setIsOpen(false)
    setSearchQuery('')

    option.onSelect?.(option.data)
    if (option.disableAddToEditor) return

    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        insertMention({
          selection,
          option,
          searchQuery
        })
      }
    })
  }

  const handleCloseWithoutSelect = () => {
    setSearchQuery('')
    clearMentionInput()
  }

  return (
    <MentionSelector
      open={isOpen}
      searchQuery={searchQuery}
      onOpenChange={setIsOpen}
      onSelect={handleMentionSelect}
      onCloseWithoutSelect={handleCloseWithoutSelect}
      mentionOptions={mentionOptions}
    >
      <div
        style={
          mentionPosition
            ? {
                position: 'fixed',
                top: `${mentionPosition.top}px`,
                left: `${mentionPosition.left}px`,
                zIndex: 2,
                height: '1rem'
              }
            : {}
        }
      />
    </MentionSelector>
  )
}

const insertMention = ({
  selection,
  option,
  searchQuery
}: {
  selection: RangeSelection
  option: MentionOption
  searchQuery: string
}) => {
  // Delete the @ symbol and the search query
  const anchorOffset = selection.anchor.offset
  selection.anchor.offset = anchorOffset - (searchQuery.length + 1)
  selection.focus.offset = anchorOffset
  selection.removeText()

  if (!option.type) throw new Error('Mention option type is required')

  // Create and insert the mention node
  const mentionText = `@${option.label}`
  const mentionNode = $createMentionNode(option.type, option.data, mentionText)
  selection.insertNodes([mentionNode])

  // Insert a space after the mention node
  const spaceNode = $createTextNode(' ')
  mentionNode.insertAfter(spaceNode)

  // Move selection after the space
  spaceNode.select()
}
