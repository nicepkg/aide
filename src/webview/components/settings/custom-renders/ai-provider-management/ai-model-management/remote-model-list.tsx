import { ReloadIcon } from '@radix-ui/react-icons'
import type { AIModel, AIModelFeature } from '@shared/entities'
import { Button } from '@webview/components/ui/button'
import { CardList } from '@webview/components/ui/card-list'
import { Switch } from '@webview/components/ui/switch'

import { ModelFeatureList } from './model-feature-list'
import { ModelItem } from './model-item'

interface RemoteModelListProps {
  models: AIModel[]
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  onRefreshModels: () => void
  onTestModels: (model: AIModel, features: AIModelFeature[]) => void
  onAddToManual: (model: AIModel) => void
}

export const RemoteModelList = ({
  models,
  enabled,
  onEnabledChange,
  onRefreshModels,
  onTestModels,
  onAddToManual
}: RemoteModelListProps) => (
  <CardList
    idField="id"
    items={models}
    title="Remote Models"
    draggable={false}
    selectable={false}
    expandable
    minCardWidth={200}
    headerRightActions={
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        <Button variant="ghost" size="iconXs" onClick={onRefreshModels}>
          <ReloadIcon className="size-4" />
        </Button>
      </div>
    }
    renderCard={({ item: model }) => (
      <ModelItem model={model} isRemote onAdd={onAddToManual} />
    )}
    renderExpandedContent={model => (
      <ModelFeatureList model={model} onTest={onTestModels} />
    )}
  />
)
