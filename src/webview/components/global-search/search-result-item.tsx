import { Fragment } from 'react/jsx-runtime'
import { capitalizeFirstLetter } from '@shared/utils/common'
import { cn } from '@webview/utils/common'

export interface SearchResultItemProps {
  icon?: React.ReactNode
  breadcrumbs: string[]
  title: string
  description?: string
  className?: string
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  icon,
  breadcrumbs,
  title,
  description,
  className
}) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <div className="flex items-center text-xs text-muted-foreground">
      {icon && <span className="mr-1">{icon}</span>}
      {breadcrumbs.map((crumb, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="mx-1">›</span>}
          <span>{capitalizeFirstLetter(crumb)}</span>
        </Fragment>
      ))}
    </div>
    <div>
      <div className="font-medium">{title}</div>
      {description && (
        <div className="text-xs text-muted-foreground line-clamp-1">
          {description}
        </div>
      )}
    </div>
  </div>
)
