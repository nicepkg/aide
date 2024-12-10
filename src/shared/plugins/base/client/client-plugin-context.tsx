import React, { createContext, useContext, useRef } from 'react'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { useImmer } from 'use-immer'

import { ProviderUtils } from '../provider-manager'
import { PluginId, PluginState } from '../types'
import type { ClientPluginProviderMap } from './client-plugin-types'

type ProviderKey = keyof ClientPluginProviderMap

type IdProviderMap = Record<
  PluginId,
  () => ClientPluginProviderMap[ProviderKey]
>

export interface ClientPluginContextValue {
  state: Record<PluginId, PluginState>
  getState: () => Record<PluginId, PluginState>
  setState: (
    pluginId: PluginId,
    updater: PluginState | ((draft: PluginState) => void)
  ) => void
  registerProvider: <K extends ProviderKey>(
    pluginId: PluginId,
    providerKey: K,
    provider: () => ClientPluginProviderMap[K]
  ) => void
  getProviders: <K extends ProviderKey>(
    providerKey: K
  ) => ClientPluginProviderMap[K][]
  mergeProviders: <K extends ProviderKey>(
    providerKey: K
  ) => ClientPluginProviderMap[K] | undefined
}

const ClientPluginContext = createContext<ClientPluginContextValue | null>(null)

export const ClientPluginProvider: React.FC<React.PropsWithChildren> = ({
  children
}) => {
  const [state, setState] = useImmer<Record<PluginId, PluginState>>(
    {} as Record<PluginId, PluginState>
  )
  const providerKeyInfoMapRef = useRef({} as Record<ProviderKey, IdProviderMap>)

  const setPluginState = (
    pluginId: PluginId,
    updater: PluginState | ((draft: PluginState) => void)
  ) => {
    setState(draft => {
      if (!draft[pluginId]) {
        draft[pluginId] = {}
      }
      if (typeof updater === 'function') {
        updater(draft[pluginId])
      } else {
        draft[pluginId] = updater
      }
    })
  }

  const registerProvider = <K extends keyof ClientPluginProviderMap>(
    pluginId: PluginId,
    providerKey: K,
    provider: () => ClientPluginProviderMap[K]
  ) => {
    if (!providerKeyInfoMapRef.current[providerKey]) {
      providerKeyInfoMapRef.current[providerKey] = {} as IdProviderMap
    }
    providerKeyInfoMapRef.current[providerKey]![pluginId] = provider
  }

  const getProviders = <K extends keyof ClientPluginProviderMap>(
    providerKey: K
  ): ClientPluginProviderMap[K][] => {
    const idProviderMap = (providerKeyInfoMapRef.current[providerKey] ||
      {}) as Record<PluginId, () => ClientPluginProviderMap[K]>

    return ProviderUtils.getValues(idProviderMap)
  }

  const mergeProviders = <K extends keyof ClientPluginProviderMap>(
    providerKey: K
  ): ClientPluginProviderMap[K] | undefined => {
    const idProviderMap = (providerKeyInfoMapRef.current[providerKey] ||
      {}) as Record<PluginId, () => ClientPluginProviderMap[K]>

    const result = ProviderUtils.mergeAll(idProviderMap)

    return result
  }

  const getState = useCallbackRef(() => state)

  return (
    <ClientPluginContext.Provider
      value={{
        state,
        getState,
        setState: setPluginState,
        registerProvider,
        getProviders,
        mergeProviders
      }}
    >
      {children}
    </ClientPluginContext.Provider>
  )
}

export const usePlugin = () => {
  const context = useContext(ClientPluginContext)
  if (!context) {
    throw new Error('usePlugin must be used within ClientPluginProvider')
  }
  return context
}
