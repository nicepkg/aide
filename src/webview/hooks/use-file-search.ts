import { useEffect, useState } from 'react'
import type { FileItem } from '@webview/components/chat/editor/types'

const initialFiles: FileItem[] = [
  {
    name: 'traverse-fs.ts',
    path: '../file-utils/traverse-fs.ts',
    type: 'file'
  },
  { name: 'App.tsx', path: 'src/webview/App.tsx', type: 'component' }
  // ... 其他文件
]

export const useFileSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFiles, setFilteredFiles] = useState(initialFiles)

  useEffect(() => {
    const filtered = initialFiles.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredFiles(filtered)
  }, [searchQuery])

  return { searchQuery, setSearchQuery, filteredFiles }
}
