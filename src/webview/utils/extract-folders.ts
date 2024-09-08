import type { FileInfo, FolderInfo } from '@extension/file-utils/traverse-fs'

export const extractFolders = (files: FileInfo[]): FolderInfo[] => {
  const folderSet = new Set<string>()

  files.forEach(file => {
    const parts = file.relativePath.split('/')
    let currentPath = ''

    for (let i = 0; i < parts.length - 1; i++) {
      currentPath += (i > 0 ? '/' : '') + parts[i]
      folderSet.add(currentPath)
    }
  })

  return Array.from(folderSet)
    .sort()
    .map(relativePath => {
      const file = files.find(f =>
        f.relativePath.startsWith(`${relativePath}/`)
      )
      return {
        type: 'folder',
        relativePath,
        fullPath: file
          ? file.fullPath.slice(
              0,
              file.fullPath.lastIndexOf(file.relativePath) + relativePath.length
            )
          : ''
      }
    })
}
