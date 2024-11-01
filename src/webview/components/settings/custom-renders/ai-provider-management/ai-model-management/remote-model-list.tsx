import { ReloadIcon } from '@radix-ui/react-icons'
import { type AIModel, type AIModelFeature } from '@shared/utils/ai-providers'
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
}

export const RemoteModelList = ({
  models,
  enabled,
  onEnabledChange,
  onRefreshModels,
  onTestModels
}: RemoteModelListProps) => (
  <CardList
    idField="id"
    items={models}
    title="Remote Models"
    draggable={false}
    expandable
    headerLeftActions={
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        <Button variant="ghost" size="iconXs" onClick={onRefreshModels}>
          <ReloadIcon className="size-4" />
        </Button>
      </div>
    }
    renderCard={({ item: model, isSelected, onSelect }) => (
      <ModelItem
        model={model}
        isRemote
        isSelected={isSelected}
        onSelect={onSelect}
      />
    )}
    renderExpandedContent={model => (
      <ModelFeatureList model={model} onTest={onTestModels} />
    )}
  />
)
