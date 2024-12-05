export type SettingsSaveType = 'global' | 'workspace'

interface BaseRenderOptions<FormType, ValueType> {
  type: FormType
  label: string
  description: string
  placeholder?: string
  defaultValue: ValueType
}

export type InputRenderOptions = BaseRenderOptions<'input', string>
export type TextareaRenderOptions = BaseRenderOptions<'textarea', string>
export type SwitchRenderOptions = BaseRenderOptions<'switch', boolean>
export type NumberInputRenderOptions = BaseRenderOptions<'numberInput', number>
export type SelectInputRenderOptions = BaseRenderOptions<
  'selectInput',
  string
> & {
  options: Array<string | { label: string; value: string }>
}
export type ArrayInputRenderOptions = BaseRenderOptions<'arrayInput', any[]>
export type ObjectInputRenderOptions = BaseRenderOptions<
  'objectInput',
  Record<string, any>
>
export type ModelManagementRenderOptions = BaseRenderOptions<
  'modelManagement',
  any
>
export type DocIndexingRenderOptions = BaseRenderOptions<'docManagement', any>
export type CodebaseIndexingRenderOptions = BaseRenderOptions<
  'codebaseIndexing',
  any
>

export type RenderOptions =
  | InputRenderOptions
  | TextareaRenderOptions
  | SwitchRenderOptions
  | NumberInputRenderOptions
  | SelectInputRenderOptions
  | ArrayInputRenderOptions
  | ObjectInputRenderOptions
  | ModelManagementRenderOptions
  | DocIndexingRenderOptions
  | CodebaseIndexingRenderOptions

export type RenderOptionsType = RenderOptions['type']
export type RenderOptionsMap = {
  [T in RenderOptionsType]: Extract<RenderOptions, { type: T }>
}
