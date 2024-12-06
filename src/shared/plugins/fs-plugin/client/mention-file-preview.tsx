import { ChevronDownIcon } from '@radix-ui/react-icons'
import { ContentPreview } from '@webview/components/content-preview'
import { FileIcon } from '@webview/components/file-icon'
import { Tree, type TreeNodeRenderProps } from '@webview/components/tree'
import { useFilesTreeItems } from '@webview/hooks/chat/use-files-tree-items'
import type { FileInfo, MentionOption } from '@webview/types/chat'

export const MentionFilePreview: React.FC<MentionOption> = mentionOption => {
  const fileInfo = mentionOption.data as FileInfo
  const { treeItems, getAllChildrenIds } = useFilesTreeItems({
    files: [fileInfo]
  })

  const allExpandedIds = getAllChildrenIds(treeItems[0]!)

  const renderItem = ({
    item,
    isExpanded,
    onToggleExpand,
    level
  }: TreeNodeRenderProps) => (
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
  )

  return (
    <div className="flex flex-col h-[50vh] overflow-hidden">
      <div className="flex flex-col shrink-0 overflow-auto">
        <Tree
          items={treeItems}
          expandedItemIds={allExpandedIds}
          renderItem={renderItem}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <ContentPreview content={{ type: 'file', path: fileInfo.fullPath }} />
      </div>
    </div>
  )
}
