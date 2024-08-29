import { useEffect, useState } from 'react'
import type { FileInfo } from '@webview/types/chat'

const initialFiles: FileInfo[] = [
  {
    relativePath: '../file-utils/traverse-fs.ts',
    fullPath: '/Users/username/project/src/file-utils/traverse-fs.ts',
    content: ''
  },
  {
    relativePath: 'src/webview/App.tsx',
    fullPath: '/Users/username/project/src/webview/App.tsx',
    content: ''
  },
  {
    relativePath: 'src/webview/hooks/use-file-search.ts',
    fullPath: '/Users/username/project/src/webview/hooks/use-file-search.ts',
    content: ''
  }
  // ... 其他文件
]

export const useFileSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFiles, setFilteredFiles] = useState(initialFiles)

  useEffect(() => {
    const filtered = initialFiles.filter(file =>
      file.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredFiles(filtered)
  }, [searchQuery])

  return { searchQuery, setSearchQuery, filteredFiles }
}
