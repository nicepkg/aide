// components/FileList.tsx
import React from 'react'
import { FileIcon } from '@radix-ui/react-icons'

import { ComponentIcon } from './icons'
import type { FileItem } from './types'

interface FileListProps {
  files: FileItem[]
  onFileSelect: (file: FileItem) => void
}

export const FileList: React.FC<FileListProps> = ({ files, onFileSelect }) => (
  <div className="file-list text-sm">
    {files.map((file, index) => (
      <div
        key={index}
        className="file-item flex items-center p-2 hover:bg-gray-800 cursor-pointer"
        onClick={() => onFileSelect(file)}
      >
        {file.type === 'file' ? (
          <FileIcon className="w-4 h-4 mr-2 text-blue-400" />
        ) : (
          <ComponentIcon className="w-4 h-4 mr-2 text-blue-400" />
        )}
        <span className="flex-grow">{file.name}</span>
        <span className="text-gray-500 text-xs">{file.path}</span>
      </div>
    ))}
  </div>
)
