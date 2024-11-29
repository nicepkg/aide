import path from 'path'
import { logger } from '@extension/logger'
import { getWorkspaceFolder } from '@extension/utils'
import type { TreeInfo } from '@shared/plugins/fs-plugin/types'
import * as vscode from 'vscode'

import { traverseFileOrFolders, type FsItemInfo } from './traverse-fs'

interface TreeNode {
  name: string
  fullPath: string
  relativePath: string
  isDirectory: boolean
  children: TreeNode[]
  depth: number
}

class TreeBuilder {
  private rootNodes: TreeNode[] = []

  constructor(private items: FsItemInfo[]) {}

  build(): TreeNode[] {
    // Create node map for O(1) lookup
    const nodeMap = new Map<string, TreeNode>()

    // Group items by depth for level-by-level processing
    // Time: O(n), Space: O(n)
    const depthGroups: FsItemInfo[][] = []
    for (const item of this.items) {
      const depth = ['', '.', './', '.\\'].includes(item.relativePath)
        ? 0
        : item.relativePath.split(path.sep).length
      if (!depthGroups[depth]) depthGroups[depth] = []
      depthGroups[depth]!.push(item)
    }

    // Process nodes level by level, from root to leaves
    // This ensures parents are always created before children
    // Time: O(n log k) where k is max nodes at same level
    for (const group of depthGroups) {
      if (!group) continue

      // Process nodes at the same level
      // These could potentially be processed in parallel
      for (const item of group) {
        const node: TreeNode = {
          name: path.basename(item.fullPath),
          fullPath: item.fullPath,
          relativePath: item.relativePath,
          isDirectory: item.type === 'folder',
          children: [],
          depth:
            item.relativePath === '.'
              ? 0
              : item.relativePath.split(path.sep).length
        }
        nodeMap.set(item.fullPath, node)

        // Find and link to parent
        // Parent is guaranteed to exist in nodeMap if it's not a root
        const parentPath = path.dirname(item.fullPath)
        const parent = nodeMap.get(parentPath)

        if (parent) {
          parent.children.push(node)
        } else {
          this.rootNodes.push(node)
        }
      }

      // Sort nodes at current level
      // Time: O(k log k) where k is number of nodes at this level
      for (const node of nodeMap.values()) {
        if (node.depth === depthGroups.indexOf(group)) {
          this.sortNodes(node.children)
        }
      }
    }

    // Finally sort root nodes
    this.sortNodes(this.rootNodes)
    return this.rootNodes
  }

  toListString(): string {
    const paths: string[] = []

    const collectPaths = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        paths.push(node.relativePath)
        if (node.children.length > 0) {
          collectPaths(node.children)
        }
      }
    }

    collectPaths(this.rootNodes)
    return paths.join('\n')
  }

  /**
   * Sort nodes with directories first, then alphabetically
   * Time: O(n log n) where n is number of nodes to sort
   */
  private sortNodes(nodes: TreeNode[]) {
    nodes.sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name)
      }
      return a.isDirectory ? -1 : 1
    })
  }
}

class TreeFormatter {
  static toTreeString(tree: TreeNode[], prefix = '', isRoot = true): string {
    let result = ''
    tree.forEach((node, index) => {
      const isLast = index === tree.length - 1
      const connector = isRoot ? '' : isLast ? '└── ' : '├── '
      const childPrefix = isRoot ? '' : isLast ? '    ' : '│   '

      result += `${prefix + connector + (isRoot ? node.relativePath : node.name)}\n`
      if (node.children.length > 0) {
        result += this.toTreeString(node.children, prefix + childPrefix, false)
      }
    })
    return result
  }

  static toListString(tree: TreeNode[]): string {
    const paths: string[] = []

    const collectPaths = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        paths.push(node.relativePath)
        if (node.children.length > 0) {
          collectPaths(node.children)
        }
      }
    }

    collectPaths(tree)
    return paths.join('\n')
  }
}

/**
 * Get tree info for a directory
 */
export async function getTreeInfo(
  fullPath: string
): Promise<TreeInfo | undefined> {
  try {
    const workspaceFolder = getWorkspaceFolder()
    const workspacePath = workspaceFolder.uri.fsPath
    const stat = await vscode.workspace.fs.stat(vscode.Uri.file(fullPath))

    if (stat.type !== vscode.FileType.Directory) return

    const items = await traverseFileOrFolders({
      type: 'fileOrFolder',
      filesOrFolders: [fullPath],
      workspacePath,
      isGetFileContent: false,
      itemCallback: item => item
    })

    const tree = new TreeBuilder(items).build()
    const treeString = TreeFormatter.toTreeString(tree)
    const listString = TreeFormatter.toListString(tree)

    return {
      type: 'tree',
      fullPath,
      relativePath: path.relative(workspacePath, fullPath),
      treeString,
      listString
    }
  } catch (error) {
    logger.error('Error getting tree info:', error)
    return undefined
  }
}

/**
 * Get tree info for multiple directories in workspace with depth limit
 */
export async function getWorkspaceTreesInfo(depth = 5): Promise<TreeInfo[]> {
  try {
    const workspaceFolder = getWorkspaceFolder()
    const workspacePath = workspaceFolder.uri.fsPath

    const items = await traverseFileOrFolders({
      type: 'fileOrFolder',
      filesOrFolders: [workspacePath],
      workspacePath,
      isGetFileContent: false,
      itemCallback: item => item
    })

    const treeBuilder = new TreeBuilder(items)
    const fullTree = treeBuilder.build()
    const treeInfos: TreeInfo[] = []

    const processDirectory = (node: TreeNode): void => {
      if (!node.isDirectory || node.depth > depth || !node.children.length)
        return

      const treeString = TreeFormatter.toTreeString([node])
      const listString = TreeFormatter.toListString([node])

      treeInfos.push({
        type: 'tree',
        fullPath: node.fullPath,
        relativePath: node.relativePath,
        treeString,
        listString
      })

      node.children.forEach(processDirectory)
    }

    fullTree.forEach(processDirectory)

    return treeInfos.sort((a, b) =>
      a.relativePath.localeCompare(b.relativePath)
    )
  } catch (error) {
    logger.error('Error getting workspace trees info:', error)
    return []
  }
}
