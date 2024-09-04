import { useMemo, useState } from 'react'
import type { FileInfo } from '@webview/types/chat'

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

const mockFiles = [
  {
    relativePath: 'src/components/Button.tsx',
    fullPath: '/project/src/components/Button.tsx'
  },
  {
    relativePath: 'src/components/Input.tsx',
    fullPath: '/project/src/components/Input.tsx'
  },
  {
    relativePath: 'src/utils/helpers.ts',
    fullPath: '/project/src/utils/helpers.ts'
  },
  {
    relativePath: 'public/images/logo.png',
    fullPath: '/project/public/images/logo.png'
  }
] as FileInfo[]

export const useFileSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return mockFiles
    return mockFiles.filter(file =>
      file.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return { searchQuery, setSearchQuery, filteredFiles }
}
