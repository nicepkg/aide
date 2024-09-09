import { useCallback, useMemo } from 'react'
import type { TreeItem } from '@webview/components/tree'
import type { FileInfo } from '@webview/types/chat'
import { pathDirname, pathJoin, toUnixPath } from '@webview/utils/path'

export interface UseFilesTreeItemsOptions {
  files: FileInfo[]
}

export const useFilesTreeItems = (options: UseFilesTreeItemsOptions) => {
  const { files } = options
  const treeItems = useMemo(() => convertFilesToTreeItems(files), [files])
  const flattenedItems = useMemo(() => flattenTreeItems(treeItems), [treeItems])

  const getAllChildrenIds = useCallback((item: TreeItem): string[] => {
    const ids: string[] = [item.id]
    if (item.children) {
      item.children.forEach(child => {
        ids.push(...getAllChildrenIds(child))
      })
    }
    return ids
  }, [])

  return { treeItems, flattenedItems, getAllChildrenIds }
}

// Helper functions (flattenTreeItems and convertFilesToTreeItems) remain unchanged
const flattenTreeItems = (items: TreeItem[]): TreeItem[] =>
  items.reduce((acc: TreeItem[], item) => {
    acc.push(item)
    if (item.children) {
      acc.push(...flattenTreeItems(item.children))
    }
    return acc
  }, [])

const convertFilesToTreeItems = (files: FileInfo[]): TreeItem[] => {
  const root: Record<string, any> = {}

  files.forEach(file => {
    const parts = toUnixPath(file.relativePath).split('/')
    let current = root

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] =
          index === parts.length - 1 ? { ...file, isLeaf: true } : {}
      }
      if (index < parts.length - 1) current = current[part]
    })
  })

  const sortItems = (items: TreeItem[]): TreeItem[] =>
    items.sort((a, b) => {
      // Folders come before files
      if (a.children && !b.children) return -1
      if (!a.children && b.children) return 1

      // Alphabetical sorting within each group
      return a.name.localeCompare(b.name)
    })

  const buildTreeItems = (node: any, path: string[] = []): TreeItem => {
    const name = path[path.length - 1] || 'root'
    // const fullPath = toPlatformPath(path.join('/'))

    if (node.isLeaf) {
      return {
        id: node.fullPath,
        name,
        isLeaf: true,
        fullPath: node.fullPath,
        relativePath: node.relativePath
      }
    }

    const children = Object.entries(node).map(([key, value]) =>
      buildTreeItems(value, [...path, key])
    )

    // For non-leaf nodes (directories)
    const relativePath = pathJoin(...path)
    let fullPath = ''

    // Try to infer the fullPath from children
    if (children.length > 0 && children[0]?.fullPath) {
      const childFullPath = children[0].fullPath
      fullPath = pathJoin(pathDirname(childFullPath), relativePath)
    }

    return {
      id: fullPath || 'root',
      name,
      children: sortItems(children),
      fullPath,
      relativePath
    }
  }

  return sortItems(
    Object.entries(root).map(([key, value]) => buildTreeItems(value, [key]))
  )
}
