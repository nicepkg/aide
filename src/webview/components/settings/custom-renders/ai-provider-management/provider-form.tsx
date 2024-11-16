import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons'
import {
  AIProviderType,
  createAIProviderEntity,
  getAllAIProviderConfigMap,
  OpenAIProviderEntity,
  type AIProvider
} from '@shared/entities'
import { Button } from '@webview/components/ui/button'
import { Input } from '@webview/components/ui/input'
import { Label } from '@webview/components/ui/label'
import { ScrollArea } from '@webview/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@webview/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@webview/components/ui/tabs'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { AIModelManagement } from './ai-model-management'
import { providerFormSchema } from './utils'

enum ProviderFormTab {
  Provider = 'provider',
  Models = 'models'
}

interface ProviderFormProps {
  isEditMode: boolean
  initProvider?: AIProvider
  onSubmit: (data: Partial<AIProvider>) => Promise<void>
  onClose: () => void
}

export const ProviderForm = ({
  isEditMode,
  initProvider,
  onSubmit,
  onClose
}: ProviderFormProps) => {
  const [activeTab, setActiveTab] = useState<ProviderFormTab>(
    ProviderFormTab.Provider
  )
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {}
  )
  const aiProviderConfigs = getAllAIProviderConfigMap()

  const getDefaultProvider = useCallbackRef(
    () => initProvider || new OpenAIProviderEntity().entity
  )

  const { control, handleSubmit, reset, setValue, formState } = useForm<
    Partial<AIProvider>
  >({
    defaultValues: getDefaultProvider(),
    resolver: zodResolver(providerFormSchema)
  })

  const draftProvider = useWatch({ control })
  const setDraftProvider = (data: Partial<AIProvider>) => {
    Object.entries(data).forEach(([key, value]) => {
      setValue(key as keyof AIProvider, value)
    })
  }

  const type = draftProvider.type || AIProviderType.OpenAI
  useEffect(() => {
    setValue(
      'extraFields',
      type === getDefaultProvider()?.type
        ? getDefaultProvider().extraFields
        : createAIProviderEntity(type).entity.extraFields
    )
  }, [type, setValue, getDefaultProvider])

  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields(prev => ({ ...prev, [fieldKey]: !prev[fieldKey] }))
  }

  const handleUpdateProvider = async () => {
    if (!formState.isValid) return
    await onSubmit(draftProvider as Partial<AIProvider>)
  }

  const handleCreateProvider = async () => {
    if (!formState.isValid) return
    await onSubmit(draftProvider as Partial<AIProvider>)
    reset()
    onClose()
  }

  const handleNextStep = () => {
    setActiveTab(ProviderFormTab.Models)
  }

  const renderProviderFields = () => (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Provider Type</Label>
        <Controller
          name="type"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select
              value={value}
              onValueChange={val => {
                onChange(val)
                setValue(
                  'extraFields',
                  createAIProviderEntity(val as AIProviderType).entity
                    .extraFields
                )
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(aiProviderConfigs).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Provider Name</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} className="text-sm" />}
        />
      </div>

      {aiProviderConfigs[type!]?.fields.map(field => (
        <div key={field.key} className="space-y-2">
          <Label className="text-xs">{field.label}</Label>
          <Controller
            name={`extraFields.${field.key}`}
            control={control}
            defaultValue={field.defaultValue || ''}
            render={({ field: { onChange, value } }) => (
              <div className="flex items-center space-x-2">
                <Input
                  value={value || ''}
                  onChange={onChange}
                  className="text-sm"
                  disabled={field.disabled}
                  type={
                    field.isSecret && !visibleFields[field.key]
                      ? 'password'
                      : 'text'
                  }
                />
                {field.isSecret && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => toggleFieldVisibility(field.key)}
                  >
                    {visibleFields[field.key] ? (
                      <EyeOpenIcon className="h-4 w-4" />
                    ) : (
                      <EyeClosedIcon className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            )}
          />
        </div>
      ))}
    </>
  )

  return (
    <Tabs
      value={activeTab}
      onValueChange={val => setActiveTab(val as ProviderFormTab)}
      className="h-full flex flex-col flex-1 overflow-y-auto"
    >
      <TabsList mode="underlined" className="shrink-0">
        <TabsTrigger mode="underlined" value={ProviderFormTab.Provider}>
          Provider
        </TabsTrigger>
        {formState.isValid && (
          <TabsTrigger
            mode="underlined"
            value={ProviderFormTab.Models}
            disabled={!formState.isValid && !draftProvider}
          >
            Models
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent
        value={ProviderFormTab.Provider}
        className="flex-1 overflow-hidden"
      >
        <form
          onSubmit={handleSubmit(
            isEditMode ? handleUpdateProvider : handleNextStep
          )}
          className="flex flex-col justify-between h-full overflow-hidden"
        >
          <ScrollArea className="flex-1">
            <div className="flex-1">{renderProviderFields()}</div>
          </ScrollArea>
          <Button
            type="submit"
            className="w-full text-sm"
            disabled={!formState.isValid}
          >
            {isEditMode ? 'Update Provider' : 'Next Step'}
          </Button>
        </form>
      </TabsContent>

      <TabsContent
        value={ProviderFormTab.Models}
        className="flex-1 overflow-hidden"
      >
        <div className="flex flex-col justify-between h-full overflow-hidden">
          {formState.isValid && (
            <>
              <ScrollArea className="flex-1">
                <AIModelManagement
                  provider={draftProvider as AIProvider}
                  setProvider={setDraftProvider}
                  className="flex-1 h-full overflow-hidden"
                />
              </ScrollArea>
              <Button
                onClick={
                  isEditMode ? handleUpdateProvider : handleCreateProvider
                }
                className="w-full text-sm mt-4 shrink-0"
                disabled={!formState.isValid}
              >
                {isEditMode ? 'Update Provider' : 'Create Provider'}
              </Button>
            </>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
