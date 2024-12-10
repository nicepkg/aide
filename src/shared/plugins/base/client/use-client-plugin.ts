import { useEffect } from 'react'

import { PluginId, PluginState } from '../types'
import { usePlugin } from './client-plugin-context'
import type { ClientPluginProviderMap } from './client-plugin-types'

export interface ClientPlugin<State extends PluginState = PluginState> {
  id: PluginId
  version: string
  getInitialState: () => State
  usePlugin: () => void
}

export type SetupProps<State extends PluginState> = {
  state: State
  setState: (updater: (draft: State) => void) => void
  registerProvider: <K extends keyof ClientPluginProviderMap>(
    providerKey: K,
    provider: () => ClientPluginProviderMap[K]
  ) => void
}

export const createClientPlugin = <State extends PluginState>(options: {
  id: PluginId
  version: string
  getInitialState: () => State
  setup: (context: SetupProps<State>) => void
}): ClientPlugin<State> => ({
  id: options.id,
  version: options.version,
  getInitialState: options.getInitialState,
  usePlugin() {
    const { state, setState, registerProvider } = usePlugin()

    useEffect(() => {
      setState(options.id, options.getInitialState())
    }, [])

    const pluginState = (state[options.id] ||
      options.getInitialState()) as State

    options.setup({
      state: pluginState,
      setState: updater => setState(options.id, updater),
      registerProvider: (key, provider) =>
        registerProvider(
          options.id,
          key as keyof ClientPluginProviderMap,
          provider as () => ClientPluginProviderMap[keyof ClientPluginProviderMap]
        )
    })
  }
})
