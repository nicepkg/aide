import { useMemo, useState } from 'react'
import { getFileNameFromPath } from '@webview/utils/path'

import { useFiles } from '../api/use-files'

// const initialFiles: FileInfo[] = [
//   {
//     relativePath: '../file-utils/traverse-fs.ts',
//     fullPath: '/Users/username/project/src/file-utils/traverse-fs.ts',
//     content: ''
//   },
//   {
//     relativePath: 'src/webview/App.tsx',
//     fullPath: '/Users/username/project/src/webview/App.tsx',
//     content: ''
//   },
//   {
//     relativePath: 'src/webview/hooks/use-file-search.ts',
//     fullPath: '/Users/username/project/src/webview/hooks/use-file-search.ts',
//     content: ''
//   }
//   // ... 其他文件
// ]

// const mockFiles = [
//   {
//     relativePath: 'src/components/Button.tsx',
//     fullPath: '/project/src/components/Button.tsx'
//   },
//   {
//     relativePath: 'src/components/Input.tsx',
//     fullPath: '/project/src/components/Input.tsx'
//   },
//   {
//     relativePath: 'src/utils/helpers.ts',
//     fullPath: '/project/src/utils/helpers.ts'
//   },
//   {
//     relativePath: 'public/images/logo.png',
//     fullPath: '/project/public/images/logo.png'
//   }
// ] as FileInfo[]

export const useFilesSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: workspaceFiles = [] } = useFiles()

  const filteredFiles = useMemo(() => {
    if (!searchQuery)
      return workspaceFiles.sort((a, b) =>
        getFileNameFromPath(a.relativePath).localeCompare(
          getFileNameFromPath(b.relativePath)
        )
      )

    return workspaceFiles
      .filter(file =>
        file.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aIndex = a.relativePath.indexOf(searchQuery)
        const bIndex = b.relativePath.indexOf(searchQuery)
        return aIndex - bIndex
      })
  }, [searchQuery, workspaceFiles])

  return { searchQuery, setSearchQuery, filteredFiles }
}
