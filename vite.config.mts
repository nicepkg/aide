import vscode from '@tomjs/vite-plugin-vscode'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(() => {
  process.env.APP_BUILD_TIME = `${Date.now()}`
  process.env.APP_VERSION = pkg.version

  return {
    plugins: [
      tsconfigPaths(),
      react(),
      vscode({
        extension: {
          entry: './src/extension/index.ts',
          platform: 'node',
          target: 'node18',
          sourcemap: true,
          skipNodeModulesBundle: false
          // treeshake: {
          //   preset: 'smallest',
          //   moduleSideEffects: 'no-external'
          // }
        }
      })
    ]
  }
})
