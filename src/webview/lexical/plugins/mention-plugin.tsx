import React, { useCallback, useState, type FC } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  MentionSelector,
  type SelectedMentionStrategy
} from '@webview/components/chat/selectors/mention-selector'
import type { IMentionStrategy } from '@webview/types/chat'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  type RangeSelection
} from 'lexical'

import { useEditorCommands } from '../hooks/use-editor-commands'
import {
  useMentionManager,
  type UseMentionManagerProps
} from '../hooks/use-mention-manager'
import { useMentionSearch } from '../hooks/use-mention-search'
import { useNearestMentionPosition } from '../hooks/use-nearest-mention-position'
import { createMentionOptions } from '../mentions'
import { $createMentionNode } from '../nodes/mention-node'

export interface MentionPluginProps extends UseMentionManagerProps {}

export const MentionPlugin: FC<MentionPluginProps> = props => {
  const [editor] = useLexicalComposerContext()
  const { addMention } = useMentionManager(props)
  const [isOpen, setIsOpen] = useState(false)
  const mentionPosition = useNearestMentionPosition(editor)
  const mentionOptions = createMentionOptions()

  const { searchQuery, setSearchQuery, clearMentionInput } = useMentionSearch(
    editor,
    setIsOpen
  )

  useEditorCommands(editor, isOpen, setIsOpen)

  const handleMentionSelect = useCallback(
    ({ strategy, strategyAddData }: SelectedMentionStrategy) => {
      setIsOpen(false)
      setSearchQuery('')

      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          insertMention(selection, strategy, strategyAddData, searchQuery)
        }
      })
      addMention({ strategy, strategyAddData })
    },
    [editor, addMention, searchQuery, setSearchQuery]
  )

  const handleCloseWithoutSelect = useCallback(() => {
    setSearchQuery('')
    clearMentionInput()
  }, [setSearchQuery, clearMentionInput])

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
                zIndex: 2
              }
            : {}
        }
      />
    </MentionSelector>
  )
}

const insertMention = (
  selection: RangeSelection,
  strategy: IMentionStrategy,
  strategyAddData: any,
  searchQuery: string
) => {
  // Delete the @ symbol and the search query
  const anchorOffset = selection.anchor.offset
  selection.anchor.offset = anchorOffset - (searchQuery.length + 1)
  selection.focus.offset = anchorOffset
  selection.removeText()

  // Create and insert the mention node
  const mentionText = `@${strategyAddData.label || strategy.name}`
  const mentionNode = $createMentionNode(
    strategy.category,
    strategyAddData,
    mentionText
  )
  selection.insertNodes([mentionNode])

  // Insert a space after the mention node
  const spaceNode = $createTextNode(' ')
  mentionNode.insertAfter(spaceNode)

  // Move selection after the space
  spaceNode.select()
}
