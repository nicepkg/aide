import * as vscode from 'vscode'

import pkg from '../package.json'
import { t, translateVscodeJsonText } from './i18n'
import { logger } from './logger'
import { getCurrentWorkspaceFolderEditor, getErrorMsg } from './utils'

const pkgConfig = pkg.contributes.configuration.properties
type ConfigKey = keyof {
  [K in keyof typeof pkgConfig as K extends `aide.${infer R}`
    ? R
    : never]: (typeof pkgConfig)[K]
}

type ConfigValueTypeMap = {
  string: string
  boolean: boolean
  array: string[]
  object: Record<string, any>
  number: number
}

type ConfigValueType = keyof ConfigValueTypeMap
type ConfigKeyInfo<T extends ConfigValueType = ConfigValueType> = {
  type: T
  markdownDescription?: string
  default?: ConfigValueTypeMap[T]
  optional?: boolean
  options?: string[]
}

type ConfigKeyInfoMap = {
  [key in ConfigKey]: ConfigKeyInfo
}

const configKey = {
  readClipboardImage: {
    ...pkgConfig['aide.readClipboardImage'],
    type: 'boolean'
  },
  respectGitIgnore: {
    ...pkgConfig['aide.respectGitIgnore'],
    type: 'boolean'
  },
  ignorePatterns: {
    ...pkgConfig['aide.ignorePatterns'],
    type: 'array',
    optional: true
  },
  aiPrompt: {
    ...pkgConfig['aide.aiPrompt'],
    type: 'string'
  },
  aiCommand: {
    ...pkgConfig['aide.aiCommand'],
    type: 'string'
  },
  aiCommandCopyBeforeRun: {
    ...pkgConfig['aide.aiCommandCopyBeforeRun'],
    type: 'boolean'
  },
  aiCommandAutoRun: {
    ...pkgConfig['aide.aiCommandAutoRun'],
    type: 'boolean'
  },
  autoRememberConvertLanguagePairs: {
    ...pkgConfig['aide.autoRememberConvertLanguagePairs'],
    type: 'boolean'
  },
  convertLanguagePairs: {
    ...pkgConfig['aide.convertLanguagePairs'],
    default: pkgConfig['aide.convertLanguagePairs'].default as Record<
      string,
      string
    >,
    type: 'object',
    optional: true
  },
  codeViewerHelperPrompt: {
    ...pkgConfig['aide.codeViewerHelperPrompt'],
    type: 'string'
  },
  useSystemProxy: {
    ...pkgConfig['aide.useSystemProxy'],
    type: 'boolean'
  },
  apiConcurrency: {
    ...pkgConfig['aide.apiConcurrency'],
    type: 'number'
  },
  openaiKey: {
    ...pkgConfig['aide.openaiKey'],
    type: 'string'
  },
  openaiBaseUrl: {
    ...pkgConfig['aide.openaiBaseUrl'],
    type: 'string'
  },
  openaiModel: {
    ...pkgConfig['aide.openaiModel'],
    type: 'string'
  }
} as const satisfies ConfigKeyInfoMap

type GetConfigKeyOptions = {
  targetForGet?: vscode.ConfigurationTarget
  targetForSet?: vscode.ConfigurationTarget
  required?: boolean

  /**
   * allow custom value if options is provided
   */
  allowCustomOptionValue?: boolean
}

export const getConfigKey = async <T extends ConfigKey>(
  key: T,
  options?: GetConfigKeyOptions
): Promise<(typeof configKey)[T]['default']> => {
  const {
    targetForGet,
    targetForSet = vscode.ConfigurationTarget.Global,
    required,
    allowCustomOptionValue
  } = options || {}
  const { workspaceFolder } = getCurrentWorkspaceFolderEditor(false)
  const config = vscode.workspace.getConfiguration('aide', workspaceFolder)
  const configKeyInfo = {
    ...configKey[key],
    markdownDescription: translateVscodeJsonText(
      configKey[key].markdownDescription
    )
  } as ConfigKeyInfo
  const isRequired = required ?? !configKeyInfo.optional
  type ReturnValue = (typeof configKey)[T]['default']

  if (!configKeyInfo) {
    throw new Error(t('error.invalidConfigKey'))
  }

  let value: ReturnValue | undefined

  if (targetForGet !== undefined) {
    const inspection = config.inspect<ReturnValue>(key)
    switch (targetForGet) {
      case vscode.ConfigurationTarget.Global:
        value = inspection?.globalValue
        break
      case vscode.ConfigurationTarget.Workspace:
        value = inspection?.workspaceValue
        break
      case vscode.ConfigurationTarget.WorkspaceFolder:
        value = inspection?.workspaceFolderValue
        break
      default:
        break
    }
  } else {
    value = config.get<ReturnValue>(key)
  }

  if (value !== undefined && value !== '') return value

  if (isRequired) {
    let inputValue: ReturnValue | undefined

    switch (configKeyInfo.type) {
      case 'string':
        if (configKeyInfo.options) {
          inputValue = (await vscode.window.showQuickPick(
            configKeyInfo.options,
            {
              title: configKeyInfo.markdownDescription,
              placeHolder: configKeyInfo.default as string,
              ignoreFocusOut: true,
              canPickMany: false
            }
          )) as string | undefined
          break
        } else {
          inputValue = (await vscode.window.showInputBox({
            prompt: configKeyInfo.markdownDescription,
            placeHolder: String(configKeyInfo.default || ''),
            ignoreFocusOut: true
          })) as string | undefined
        }
        break

      case 'boolean':
        inputValue = await vscode.window
          .showQuickPick(['true', 'false'], {
            title: configKeyInfo.markdownDescription,
            placeHolder: configKeyInfo.default ? 'true' : 'false',
            ignoreFocusOut: true
          })
          .then(result => result === 'true')
        break

      case 'array':
        inputValue = await vscode.window
          .showInputBox({
            prompt: `${configKeyInfo.markdownDescription} (${t('input.array.promptEnding')})`,
            placeHolder: (configKeyInfo.default as string[]).join(', '),
            ignoreFocusOut: true
          })
          .then(result =>
            result ? result.split(',').map(item => item.trim()) : undefined
          )
        break

      case 'object':
        inputValue = await vscode.window
          .showInputBox({
            prompt: `${configKeyInfo.markdownDescription} (${t('input.json.promptEnding')})`,
            placeHolder: JSON.stringify(configKeyInfo.default, null, 2),
            ignoreFocusOut: true
          })
          .then(result => {
            try {
              return result ? JSON.parse(result) : undefined
            } catch (error) {
              throw new Error(
                `${t('error.invalidJson')}: ${getErrorMsg(error)}`
              )
            }
          })
        break

      case 'number':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        inputValue = await vscode.window
          .showInputBox({
            prompt: configKeyInfo.markdownDescription,
            placeHolder: String(configKeyInfo.default || ''),
            ignoreFocusOut: true,
            validateInput: value =>
              Number.isNaN(Number(value)) ? t('error.invalidNumber') : null
          })
          .then(result => (result ? Number(result) : undefined))
        break

      default:
        break
    }

    if (inputValue === undefined) {
      throw new Error(t('error.configKeyRequired', key))
    }

    setConfigKey(key, inputValue, { targetForSet, allowCustomOptionValue })

    return inputValue
  }

  return configKeyInfo.default as ReturnValue
}

type SetConfigKeyOptions = {
  targetForSet?: vscode.ConfigurationTarget

  /**
   * allow custom value if options is provided
   */
  allowCustomOptionValue?: boolean
}

export const setConfigKey = async <T extends ConfigKey>(
  key: T,
  value: (typeof configKey)[T]['default'],
  options?: SetConfigKeyOptions
): Promise<void> => {
  const {
    targetForSet = vscode.ConfigurationTarget.Global,
    allowCustomOptionValue = false
  } = options || {}
  const { workspaceFolder } = getCurrentWorkspaceFolderEditor(false)
  const config = vscode.workspace.getConfiguration('aide', workspaceFolder)
  const configKeyInfo = configKey[key] as ConfigKeyInfo

  if (!configKeyInfo) {
    throw new Error(t('error.invalidConfigKey'))
  }

  if (typeof value !== configKeyInfo.type) {
    throw new Error(
      t('error.invalidConfigValueType', {
        key,
        expectedType: configKeyInfo.type
      })
    )
  }

  if (
    configKeyInfo.options &&
    !configKeyInfo.options.includes(value as string) &&
    !allowCustomOptionValue
  ) {
    throw new Error(t('error.invalidConfigValueOption'))
  }

  try {
    if (
      targetForSet === vscode.ConfigurationTarget.WorkspaceFolder &&
      !workspaceFolder
    ) {
      // if can't find WorkspaceFolder, fallback to Workspace level
      await config.update(key, value, vscode.ConfigurationTarget.Workspace)
    } else {
      await config.update(key, value, targetForSet)
    }
  } catch (error) {
    logger.warn('setConfigKey', error)
    throw new Error(`${t('error.failedToUpdateConfig')}: ${getErrorMsg(error)}`)
  }
}
