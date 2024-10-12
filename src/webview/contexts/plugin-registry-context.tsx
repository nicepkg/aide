import React, {
  createContext,
  useContext,
  useRef,
  useState,
  type FC
} from 'react'
import { ClientPluginRegistry } from '@shared/plugins/base/client/client-plugin-registry'
import { createClientPlugins } from '@shared/plugins/base/client/create-client-plugins'
import type { PluginId } from '@shared/plugins/base/types'
import { useQueryClient } from '@tanstack/react-query'
import { useAsyncEffect } from '@webview/hooks/use-async-effect'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { useImmer } from 'use-immer'

const PluginRegistryContext = createContext<{
  pluginRegistry: ClientPluginRegistry | null
  isPluginRegistryLoaded: boolean
} | null>(null)

export const PluginRegistryProvider: FC<React.PropsWithChildren> = ({
  children
}) => {
  const queryClient = useQueryClient()
  const [pluginStates, updatePluginStates] = useImmer<Record<PluginId, any>>(
    {} as Record<PluginId, any>
  )
  const [isLoaded, setIsLoaded] = useState(false)

  const getState = useCallbackRef(
    (pluginId: PluginId) => pluginStates[pluginId] || {}
  )
  const setState = useCallbackRef((pluginId: PluginId, newState: any) => {
    updatePluginStates(draft => {
      draft[pluginId] = newState
    })
  })
  const pluginRegistryRef = useRef<ClientPluginRegistry | null>(null)

  useAsyncEffect(
    async () => {
      const pluginRegistry = new ClientPluginRegistry({
        queryClient,
        getState,
        setState
      })
      const plugins = createClientPlugins()

      await Promise.allSettled(
        plugins.map(plugin => pluginRegistry.loadPlugin(plugin))
      )

      pluginRegistryRef.current = pluginRegistry
      setIsLoaded(true)
    },
    async () => {
      setIsLoaded(false)
      await pluginRegistryRef.current?.unloadAllPlugins()
      pluginRegistryRef.current = null
    },
    [getState, setState]
  )

  return (
    <PluginRegistryContext.Provider
      value={{
        // eslint-disable-next-line react-compiler/react-compiler
        pluginRegistry: pluginRegistryRef.current,
        isPluginRegistryLoaded: isLoaded
      }}
    >
      {children}
    </PluginRegistryContext.Provider>
  )
}

export const usePluginRegistry = () => {
  const context = useContext(PluginRegistryContext)

  if (context === null) {
    throw new Error(
      'usePluginRegistry must be used within a PluginRegistryProvider'
    )
  }

  return context
}

export function WithPluginRegistryProvider<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithPluginRegistryProvider: React.FC<P> = props => (
    <PluginRegistryProvider>
      <WrappedComponent {...props} />
    </PluginRegistryProvider>
  )

  WithPluginRegistryProvider.displayName = `WithPluginRegistryProvider(${getDisplayName(WrappedComponent)})`

  return WithPluginRegistryProvider
}

function getDisplayName<P>(WrappedComponent: React.ComponentType<P>): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
