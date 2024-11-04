import {
  ExternalLinkIcon,
  Pencil2Icon,
  ReloadIcon,
  TrashIcon
} from '@radix-ui/react-icons'
import type { DocSite } from '@shared/entities'
import { AlertAction } from '@webview/components/ui/alert-action'
import { Button } from '@webview/components/ui/button'
import { Checkbox } from '@webview/components/ui/checkbox'
import { Progress } from '@webview/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@webview/components/ui/tooltip'

interface DocSiteCardProps {
  site: DocSite
  loading: boolean
  crawlingProgress: number
  indexingProgress: number
  onEdit: (site: DocSite) => void
  onRemove: (id: string) => void
  onCrawl: (id: string) => void
  onReindex: (id: string) => void
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
}

export const DocSiteCard = ({
  site,
  loading,
  crawlingProgress,
  indexingProgress,
  onEdit,
  onRemove,
  onCrawl,
  onReindex,
  isSelected,
  onSelect
}: DocSiteCardProps) => {
  const renderProgressSection = (
    label: string,
    progress: number,
    isCompleted: boolean,
    onAction: () => void
  ) => (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-medium text-muted-foreground">
            {label}
          </div>
          <div className="text-xs text-muted-foreground">{progress}%</div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
      <Button
        variant="outline"
        className="shrink-0 text-xs h-6 px-2"
        size="sm"
        onClick={onAction}
        disabled={loading}
      >
        {loading && <ReloadIcon className="mr-1 h-3 w-3 animate-spin" />}
        {isCompleted ? `${label}ed` : label}
      </Button>
    </div>
  )

  const renderField = (label: string, content: React.ReactNode) => (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm">{content}</div>
    </div>
  )

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-card hover:shadow-md transition-shadow space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="translate-y-[1px]"
            />
          )}
          <h3 className="font-medium text-foreground text-base">{site.name}</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => onEdit(site)}
            size="sm"
            className="h-7 w-7 p-0 hover:bg-muted"
          >
            <Pencil2Icon className="h-3.5 w-3.5" />
          </Button>
          <AlertAction
            title="Delete Documentation Site"
            description={`Are you sure you want to delete "${site.name}"? This will remove all crawled and indexed data.`}
            variant="destructive"
            confirmText="Delete"
            onConfirm={() => onRemove(site.id)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted text-destructive hover:text-destructive"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </AlertAction>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {renderField(
          'URL',
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => window.open(site.url, '_blank')}
              >
                <div className="truncate max-w-[300px] inline-block align-middle">
                  {site.url}
                </div>
                <ExternalLinkIcon className="h-3 w-3 ml-1 inline" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{site.url}</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="space-y-3 pt-1">
        {renderProgressSection('Crawl', crawlingProgress, site.isCrawled, () =>
          onCrawl(site.id)
        )}
        {renderProgressSection('Index', indexingProgress, site.isIndexed, () =>
          onReindex(site.id)
        )}
      </div>
    </div>
  )
}
