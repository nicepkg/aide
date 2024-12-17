import type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'
import type { ControllerRegister } from '@extension/registers/controller-register'
import type { Mention } from '@shared/entities'
import type { MentionUtilsProvider } from '@shared/plugins/base/server/create-provider-manager'

import { FsMentionType, type TreeInfo } from '../types'

export class FsMentionUtilsProvider implements MentionUtilsProvider {
  async createRefreshMentionFn(controllerRegister: ControllerRegister) {
    const files = await controllerRegister
      .api('file')
      .traverseWorkspaceFiles({ filesOrFolders: ['./'] })

    const folders = await controllerRegister
      .api('file')
      .traverseWorkspaceFolders({ folders: ['./'] })

    const editorErrors = await controllerRegister
      .api('file')
      .getCurrentEditorErrors()

    const treesInfo = await controllerRegister
      .api('file')
      .getWorkspaceTreesInfo({ depth: 5 })

    const filePathMapFile = new Map<string, FileInfo>()

    for (const file of files) {
      filePathMapFile.set(file.fullPath, file)
    }

    const filePathMapFolder = new Map<string, FolderInfo>()

    for (const folder of folders) {
      filePathMapFolder.set(folder.fullPath, folder)
    }

    const filePathMapTree = new Map<string, TreeInfo>()

    for (const tree of treesInfo) {
      filePathMapTree.set(tree.fullPath, tree)
    }

    return (_mention: Mention) => {
      const mention = { ..._mention } as Mention
      switch (mention.type) {
        case FsMentionType.File:
          const file = filePathMapFile.get(mention.data.fullPath)
          if (file) mention.data = file
          break

        case FsMentionType.Folder:
          const folder = filePathMapFolder.get(mention.data.fullPath)
          if (folder) mention.data = folder
          break

        case FsMentionType.Tree:
          const tree = filePathMapTree.get(mention.data.fullPath)
          if (tree) mention.data = tree
          break

        case FsMentionType.Errors:
          mention.data = editorErrors
          break

        default:
          break
      }

      return mention
    }
  }
}
