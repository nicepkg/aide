import { $isMentionNode } from '@webview/lexical/nodes/mention-node'
import type { MentionOption } from '@webview/types/chat'
import {
  $getRoot,
  $isElementNode,
  type EditorState,
  type LexicalNode
} from 'lexical'

export const updatePluginStatesFromEditorState = (
  editorState: EditorState,
  mentionOptions: MentionOption[]
): void =>
  editorState.read(() => {
    const root = $getRoot()
    const mentionTypeDataArr: Record<string, unknown[]> = {}

    const traverseNodes = (node: LexicalNode) => {
      if ($isMentionNode(node)) {
        const { mentionType, mentionData } = node.exportJSON()
        mentionTypeDataArr[mentionType] ||= []
        mentionTypeDataArr[mentionType]!.push(mentionData)
      } else if ($isElementNode(node)) {
        node.getChildren().forEach(traverseNodes)
      }
    }

    traverseNodes(root)

    Object.entries(mentionTypeDataArr).forEach(([type, dataArr]) => {
      const found = findMentionOptionByMentionType(mentionOptions, type)
      found?.onReplaceAll?.(dataArr)
    })
  })

export const findMentionOptionByMentionType = (
  mentionOptions: MentionOption[],
  mentionType: string
): MentionOption | undefined => {
  for (const option of mentionOptions) {
    if (option.children) {
      const found = findMentionOptionByMentionType(option.children, mentionType)
      if (found) {
        return found
      }
    }

    if (option.type === mentionType) {
      return option
    }
  }

  return undefined
}
