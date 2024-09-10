import { memo, useCallback, useMemo } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { FileIcon } from '@webview/components/file-icon'
import { Tree, type TreeNodeRenderProps } from '@webview/components/tree'
import { useFilesTreeItems } from '@webview/hooks/chat/use-files-tree-items'
import type { FolderInfo, MentionOption } from '@webview/types/chat'

export const MentionFolderPreview: React.FC<MentionOption> = memo(
  mentionOption => {
    const folderInfo = mentionOption.data as FolderInfo
    const { treeItems, traverseTree } = useFilesTreeItems({
      files: [folderInfo]
    })

    const allExpandedIds = useMemo(() => {
      const ids: string[] = []

      traverseTree(item => {
        if (item.children?.length) {
          ids.push(item.id)
        }
      })

      return ids
    }, [traverseTree])

    const renderItem = useCallback(
      ({ item, isExpanded, onToggleExpand, level }: TreeNodeRenderProps) => {
        const ArrowIcon = isExpanded ? ChevronDownIcon : ChevronRightIcon

        return (
          <div
            className="flex items-center py-1 text-sm cursor-pointer"
            style={{ marginLeft: `${level * 20}px` }}
            onClick={onToggleExpand}
          >
            {!item.isLeaf && <ArrowIcon className="size-4 mr-1" />}

            <FileIcon
              className="size-4 mr-1"
              isFolder={!item.isLeaf}
              isOpen={isExpanded}
              filePath={item.name}
            />

            <span>{item.name}</span>
          </div>
        )
      },
      []
    )

    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col flex-1 overflow-auto">
          <Tree
            items={treeItems}
            expandedItemIds={allExpandedIds}
            renderItem={renderItem}
          />
        </div>
      </div>
    )
  }
)
