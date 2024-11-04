import type { AIModel, AIModelFeature } from '@shared/entities'
import { CardList } from '@webview/components/ui/card-list'

import { ModelFeatureList } from './model-feature-list'
import { ModelItem } from './model-item'

interface ManualModelListProps {
  models: AIModel[]
  onReorderModels: (models: AIModel[]) => void
  onDeleteModels: (models: AIModel[]) => void
  onCreateModel: () => void
  onTestModels: (model: AIModel, features: AIModelFeature[]) => void
}

export const ManualModelList = ({
  models,
  onReorderModels,
  onDeleteModels,
  onCreateModel,
  onTestModels
}: ManualModelListProps) => (
  <CardList
    idField="id"
    items={models}
    title="Manual Models"
    draggable
    expandable
    minCardWidth={200}
    onReorderItems={onReorderModels}
    onDeleteItems={onDeleteModels}
    onCreateItem={onCreateModel}
    renderCard={({ item: model, dragHandleProps, isSelected, onSelect }) => (
      <ModelItem
        model={model}
        dragHandleProps={dragHandleProps}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    )}
    renderExpandedContent={model => (
      <ModelFeatureList model={model} onTest={onTestModels} />
    )}
  />
)
