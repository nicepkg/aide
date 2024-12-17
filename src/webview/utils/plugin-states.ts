import type { MentionOption } from '@webview/types/chat'

// export const updatePluginStatesFromEditorState = (
//   editorState: EditorState,
//   mentionOptions: MentionOption[]
// ): void =>
//   editorState.read(() => {
//     const root = $getRoot()
//     const mentionTypeDataArr: Record<string, unknown[]> = {}

//     const traverseNodes = (node: LexicalNode) => {
//       if ($isMentionNode(node)) {
//         const { mention } = node.exportJSON()
//         mentionTypeDataArr[mention.type] ||= []
//         mentionTypeDataArr[mention.type]!.push(mention.data)
//       } else if ($isElementNode(node)) {
//         node.getChildren().forEach(traverseNodes)
//       }
//     }

//     traverseNodes(root)

//     Object.entries(mentionTypeDataArr).forEach(([type, dataArr]) => {
//       const found = findMentionOptionByMentionType(mentionOptions, type)
//       found?.onUpdatePluginState?.(dataArr)
//     })
//   })

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

// export const getMentionsFromEditorState = (
//   editorState: EditorState
// ): Mention[] => {
//   const mentions: Mention[] = []

//   editorState.read(() => {
//     const root = $getRoot()

//     const traverseNodes = (node: LexicalNode) => {
//       if ($isMentionNode(node)) {
//         const { mention } = node.exportJSON()
//         mentions.push(mention)
//       } else if ($isElementNode(node)) {
//         node.getChildren().forEach(traverseNodes)
//       }
//     }

//     traverseNodes(root)
//   })

//   return mentions
// }
