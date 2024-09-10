import { memo, useCallback, useMemo } from 'react'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { FileIcon } from '@webview/components/file-icon'
import { Tree, type TreeNodeRenderProps } from '@webview/components/tree'
import { useFilesTreeItems } from '@webview/hooks/chat/use-files-tree-items'
import type { FileInfo, MentionOption } from '@webview/types/chat'

export const MentionFilePreview: React.FC<MentionOption> = memo(
  mentionOption => {
    const fileInfo = mentionOption.data as FileInfo
    const { treeItems, getAllChildrenIds } = useFilesTreeItems({
      files: [fileInfo]
    })

    const allExpandedIds = useMemo(
      () => getAllChildrenIds(treeItems[0]!),
      [treeItems, getAllChildrenIds]
    )

    const renderItem = useCallback(
      ({ item, isExpanded, onToggleExpand, level }: TreeNodeRenderProps) => (
        <div
          className="flex items-center py-1 text-sm cursor-pointer"
          style={{ marginLeft: `${level * 20}px` }}
          onClick={onToggleExpand}
        >
          {!item.isLeaf && <ChevronDownIcon className="size-4 mr-1" />}

          <FileIcon
            className="size-4 mr-1"
            isFolder={!item.isLeaf}
            isOpen={isExpanded}
            filePath={item.name}
          />

          <span>{item.name}</span>
        </div>
      ),
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
