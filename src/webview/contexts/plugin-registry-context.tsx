import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type FC
} from 'react'
import { ClientPluginRegistry } from '@shared/plugins/base/client/client-plugin-registry'
import { createClientPlugins } from '@shared/plugins/base/client/create-client-plugins'
import { type PluginId, type PluginState } from '@shared/plugins/base/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallbackRef } from '@webview/hooks/use-callback-ref'
import { useImmer } from 'use-immer'

const PluginRegistryContext = createContext<{
  pluginRegistry: ClientPluginRegistry | null
  getPluginRegistry: () => ClientPluginRegistry | undefined
} | null>(null)

export const PluginRegistryProvider: FC<React.PropsWithChildren> = ({
  children
}) => {
  const queryClient = useQueryClient()
  const [pluginStates, setPluginStates] = useImmer<
    Record<PluginId, PluginState>
  >({} as Record<PluginId, PluginState>)
  const pluginRegistryRef = useRef<ClientPluginRegistry | null>(null)
  const id = useId()

  const { data: pluginRegistry } = useQuery({
    queryKey: [id, pluginStates, queryClient],
    queryFn: async () => {
      // if the pluginRegistry is already initialized, only update the state
      if (pluginRegistryRef.current?.isInitialized) {
        pluginRegistryRef.current.init({
          queryClient,
          state: pluginStates,
          setState: setPluginStates
        })
        return pluginRegistryRef.current
      }

      // the full initialization process for the first creation or uninitialized
      const pluginRegistry = new ClientPluginRegistry()
      pluginRegistry.init({
        queryClient,
        state: pluginStates,
        setState: setPluginStates
      })

      const plugins = createClientPlugins()
      await Promise.allSettled(
        plugins.map(plugin => pluginRegistry.loadPlugin(plugin))
      )

      pluginRegistryRef.current = pluginRegistry
      return pluginRegistry
    },
    // when the component is unmounted, clean up the plugin
    gcTime: 0,
    staleTime: Infinity
  })

  // when the component is unmounted, clean up the plugin
  useEffect(
    () => () => {
      pluginRegistryRef.current?.unloadAllPlugins().then(() => {
        pluginRegistryRef.current = null
      })
    },
    []
  )

  const getPluginRegistry = useCallbackRef(() => pluginRegistry)

  return (
    <PluginRegistryContext.Provider
      value={{
        pluginRegistry: pluginRegistry ?? null,
        getPluginRegistry
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

export const WithPluginRegistryProvider = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithPluginRegistryProvider: React.FC<P> = props => (
    <PluginRegistryProvider>
      <WrappedComponent {...props} />
    </PluginRegistryProvider>
  )

  WithPluginRegistryProvider.displayName = `WithPluginRegistryProvider(${getDisplayName(
    WrappedComponent
  )})`

  return WithPluginRegistryProvider
}

function getDisplayName<P>(WrappedComponent: React.ComponentType<P>): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
