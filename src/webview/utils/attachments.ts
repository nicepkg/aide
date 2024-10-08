import { removeDuplicates } from '@shared/utils/common'
import { getDefaultConversationAttachments } from '@shared/utils/get-default-conversation-attachments'
import { $isMentionNode } from '@webview/lexical/nodes/mention-node'
import {
  AttachmentItem,
  Attachments,
  AttachmentType,
  ContextInfoSource,
  type BaseContextInfo,
  type GitDiff
} from '@webview/types/chat'
import { produce } from 'immer'
import {
  $getRoot,
  $isElementNode,
  type EditorState,
  type LexicalNode
} from 'lexical'

const deduplicateAttachments = (
  attachments: Attachments,
  onlyDeduplicateTypes?: Set<AttachmentType>,
  priorityRemoveSource: Set<ContextInfoSource> = new Set([
    ContextInfoSource.Editor
  ])
): Attachments =>
  produce(attachments, draft => {
    const prioritySelector = <T extends BaseContextInfo>(a: T, b: T) =>
      priorityRemoveSource?.has(a.source) ? b : a

    if (
      !onlyDeduplicateTypes ||
      onlyDeduplicateTypes?.has(AttachmentType.Files)
    ) {
      draft.fileContext.selectedFiles = removeDuplicates(
        draft.fileContext.selectedFiles,
        ['fullPath'],
        prioritySelector
      )
    }

    if (
      !onlyDeduplicateTypes ||
      onlyDeduplicateTypes?.has(AttachmentType.Folders)
    ) {
      draft.fileContext.selectedFolders = removeDuplicates(
        draft.fileContext.selectedFolders,
        ['fullPath'],
        prioritySelector
      )
    }

    if (
      !onlyDeduplicateTypes ||
      onlyDeduplicateTypes?.has(AttachmentType.Images)
    ) {
      draft.fileContext.selectedImages = removeDuplicates(
        draft.fileContext.selectedImages,
        ['url'],
        prioritySelector
      )
    }

    if (
      !onlyDeduplicateTypes ||
      onlyDeduplicateTypes?.has(AttachmentType.GitCommit)
    ) {
      draft.gitContext.gitCommits = removeDuplicates(
        draft.gitContext.gitCommits,
        ['sha'],
        prioritySelector
      )
    }

    if (
      !onlyDeduplicateTypes ||
      onlyDeduplicateTypes?.has(AttachmentType.GitDiff)
    ) {
      draft.gitContext.gitDiffs = removeDuplicates(
        draft.gitContext.gitDiffs,
        diff =>
          `${diff.from}|${diff.to}|${diff.chunks.map(chunk => chunk.content).join('|')}`,
        prioritySelector
      )
    }

    if (
      !onlyDeduplicateTypes ||
      onlyDeduplicateTypes?.has(AttachmentType.Docs)
    ) {
      draft.docContext.allowSearchDocSiteNames = removeDuplicates(
        draft.docContext.allowSearchDocSiteNames,
        ['name'],
        prioritySelector
      )
    }

    if (
      !onlyDeduplicateTypes ||
      onlyDeduplicateTypes?.has(AttachmentType.Code)
    ) {
      draft.codeContext.codeChunks = removeDuplicates(
        draft.codeContext.codeChunks,
        ['relativePath', 'code'],
        prioritySelector
      )
    }
  })

export const addAttachmentItems = (
  currentAttachments: Attachments | undefined,
  newItems: AttachmentItem[],
  priorityRemoveSource?: Set<ContextInfoSource>
): Attachments => {
  const deduplicateAttachmentTypes = new Set<AttachmentType>()

  const result = produce(
    currentAttachments || getDefaultConversationAttachments(),
    draft => {
      newItems.forEach(item => {
        switch (item.type) {
          case AttachmentType.Files:
            deduplicateAttachmentTypes.add(AttachmentType.Files)
            draft.fileContext.selectedFiles.push(item.data)
            break
          case AttachmentType.Folders:
            deduplicateAttachmentTypes.add(AttachmentType.Folders)
            draft.fileContext.selectedFolders.push(item.data)
            break
          case AttachmentType.Images:
            deduplicateAttachmentTypes.add(AttachmentType.Images)
            draft.fileContext.selectedImages.push(item.data)
            break
          case AttachmentType.GitCommit:
            deduplicateAttachmentTypes.add(AttachmentType.GitCommit)
            draft.gitContext.gitCommits.push(item.data)
            break
          case AttachmentType.GitDiff:
          case AttachmentType.GitPr:
            deduplicateAttachmentTypes.add(AttachmentType.GitDiff)
            draft.gitContext.gitDiffs.push(item.data)
            break
          case AttachmentType.Web:
            draft.webContext.enableTool = true
            break
          case AttachmentType.Docs:
            deduplicateAttachmentTypes.add(AttachmentType.Docs)
            draft.docContext.allowSearchDocSiteNames.push(item.data)
            break
          case AttachmentType.Code:
            deduplicateAttachmentTypes.add(AttachmentType.Code)
            draft.codeContext.codeChunks.push(item.data)
            break
          case AttachmentType.Codebase:
            draft.codebaseContext.enableTool = true
            break
          default:
            break
        }
      })
    }
  )

  return deduplicateAttachments(
    result,
    deduplicateAttachmentTypes,
    priorityRemoveSource
  )
}

export const removeAttachmentItems = (
  currentAttachments: Attachments | undefined,
  itemsToRemove: AttachmentItem[],
  priorityRemoveSource?: Set<ContextInfoSource>
): Attachments => {
  if (!currentAttachments) return getDefaultConversationAttachments()

  const deduplicateAttachmentTypes = new Set<AttachmentType>()

  const result = produce(currentAttachments, draft => {
    itemsToRemove.forEach(item => {
      switch (item.type) {
        case AttachmentType.Files:
          deduplicateAttachmentTypes.add(AttachmentType.Files)
          draft.fileContext.selectedFiles =
            draft.fileContext.selectedFiles.filter(
              file => file.fullPath !== item.data.fullPath
            )
          break
        case AttachmentType.Folders:
          deduplicateAttachmentTypes.add(AttachmentType.Folders)
          draft.fileContext.selectedFolders =
            draft.fileContext.selectedFolders.filter(
              folder => folder.fullPath !== item.data.fullPath
            )
          break
        case AttachmentType.Images:
          deduplicateAttachmentTypes.add(AttachmentType.Images)
          draft.fileContext.selectedImages =
            draft.fileContext.selectedImages.filter(
              image => image.url !== item.data.url
            )
          break
        case AttachmentType.GitCommit:
          deduplicateAttachmentTypes.add(AttachmentType.GitCommit)
          draft.gitContext.gitCommits = draft.gitContext.gitCommits.filter(
            commit => commit.sha !== item.data.sha
          )
          break
        case AttachmentType.GitDiff:
        case AttachmentType.GitPr:
          deduplicateAttachmentTypes.add(AttachmentType.GitDiff)
          draft.gitContext.gitDiffs = draft.gitContext.gitDiffs.filter(
            diff =>
              `${diff.from}|${diff.to}|${diff.chunks.map(chunk => chunk.content).join('|')}` !==
              `${item.data.from}|${item.data.to}|${(item.data as GitDiff).chunks.map(chunk => chunk.content).join('|')}`
          )
          break
        case AttachmentType.Docs:
          deduplicateAttachmentTypes.add(AttachmentType.Docs)
          draft.docContext.allowSearchDocSiteNames =
            draft.docContext.allowSearchDocSiteNames.filter(
              name => name !== item.data
            )
          break
        case AttachmentType.Code:
          deduplicateAttachmentTypes.add(AttachmentType.Code)
          draft.codeContext.codeChunks = draft.codeContext.codeChunks.filter(
            chunk =>
              !(
                chunk.relativePath === item.data.relativePath &&
                chunk.code === item.data.code
              )
          )
          break
        default:
          break
      }
    })
  })

  return deduplicateAttachments(
    result,
    deduplicateAttachmentTypes,
    priorityRemoveSource
  )
}

export const overrideAttachmentItemsBySource = (
  activeSource: ContextInfoSource,
  currentAttachments: Attachments | undefined,
  newItems: AttachmentItem[],
  priorityRemoveSource?: Set<ContextInfoSource>
): Attachments => {
  let cleanedCurrentAttachments = currentAttachments

  if (!currentAttachments) {
    cleanedCurrentAttachments = getDefaultConversationAttachments()
  } else {
    cleanedCurrentAttachments = produce(currentAttachments, draft => {
      // remove the source items
      draft.fileContext.selectedFiles = draft.fileContext.selectedFiles.filter(
        file => file.source !== activeSource
      )

      draft.fileContext.selectedFolders =
        draft.fileContext.selectedFolders.filter(
          folder => folder.source !== activeSource
        )

      draft.fileContext.selectedImages =
        draft.fileContext.selectedImages.filter(
          image => image.source !== activeSource
        )

      draft.gitContext.gitCommits = draft.gitContext.gitCommits.filter(
        commit => commit.source !== activeSource
      )

      draft.gitContext.gitDiffs = draft.gitContext.gitDiffs.filter(
        diff => diff.source !== activeSource
      )

      draft.webContext.enableTool = false

      draft.docContext.allowSearchDocSiteNames =
        draft.docContext.allowSearchDocSiteNames.filter(
          name => name.source !== activeSource
        )

      draft.codeContext.codeChunks = draft.codeContext.codeChunks.filter(
        chunk => chunk.source !== activeSource
      )

      draft.codebaseContext.enableTool = false
    })
  }

  return addAttachmentItems(
    cleanedCurrentAttachments,
    newItems,
    priorityRemoveSource
  )
}

export const getAttachmentsFromEditorState = (
  editorState: EditorState,
  currentAttachments: Attachments | undefined
): Attachments =>
  editorState.read(() => {
    const root = $getRoot()
    const attachmentItems: AttachmentItem[] = []

    const traverseNodes = (node: LexicalNode) => {
      if ($isMentionNode(node)) {
        const { mentionType, mentionData } = node.exportJSON()
        attachmentItems.push({ type: mentionType, data: mentionData })
      } else if ($isElementNode(node)) {
        node.getChildren().forEach(traverseNodes)
      }
    }

    traverseNodes(root)

    return overrideAttachmentItemsBySource(
      ContextInfoSource.Editor,
      currentAttachments,
      attachmentItems
    )
  })
