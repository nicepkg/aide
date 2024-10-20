/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import vscode from '@tomjs/vite-plugin-vscode'
import react from '@vitejs/plugin-react'
import cpy from 'cpy'
import { defineConfig } from 'vite'
import pages from 'vite-plugin-pages'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import pkg from './package.json'

const dir =
  typeof __dirname === 'string'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))

const resolvePath = (...paths: string[]) => path.resolve(dir, ...paths)

const extensionDistPath = resolvePath('dist/extension')

const resolveExtensionDistPath = (...paths: string[]) =>
  path.resolve(extensionDistPath, ...paths)

const define: Record<string, string> = {
  __EXTENSION_DIST_PATH__: JSON.stringify(extensionDistPath)
}

// https://vitejs.dev/config/
export default defineConfig(env => {
  const isBuild = env.command === 'build'
  process.env.APP_BUILD_TIME = `${Date.now()}`
  process.env.APP_VERSION = pkg.version

  return {
    define,
    plugins: [
      tsconfigPaths(),
      // react(),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']]
        }
      }),
      svgr(),
      pages({
        dirs: 'src/webview/pages',
        routeStyle: 'next',
        importMode: 'sync'
      }),
      vscode({
        extension: {
          entry: resolvePath('./src/extension/index.ts'),
          platform: 'node',
          target: 'node18',
          sourcemap: true,
          skipNodeModulesBundle: false,
          define,
          external: [
            './index.node' // shit, vectordb need this
          ],
          // esbuildPlugins: [createRedirectPlugin(redirects) as any],
          esbuildOptions(options) {
            options.alias = {
              ...options.alias,
              'onnxruntime-node': resolvePath(
                'node_modules/onnxruntime-node/dist/index.js'
              )
            }
          },
          plugins: [
            {
              name: 'copy-files',
              async buildStart() {
                await tsupCopyFiles()
              }
            }
          ]
        },
        webview: {
          csp: isBuild ? '<meta>' : undefined
        }
      })
    ],
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js' && isBuild) {
          return { runtime: `window.__assetsPath(${JSON.stringify(filename)})` }
        }
        return { relative: true }
      }
    }
  }
})

const tsupCopyFiles = async () => {
  const targets = [
    // copy node_modules to extension dist
    {
      src: resolvePath('node_modules/tree-sitter-wasms/out/*.wasm'),
      dest: resolveExtensionDistPath('tree-sitter-wasms/')
    },
    {
      src: resolvePath('node_modules/web-tree-sitter/*.wasm'),
      dest: resolveExtensionDistPath('./')
    },
    {
      src: resolvePath('node_modules/onnxruntime-node/bin/**'),
      dest: resolveExtensionDistPath('onnxruntime/bin/')
    },
    {
      src: resolvePath('node_modules/@lancedb/**'),
      dest: resolveExtensionDistPath('node_modules/@lancedb/')
    },
    {
      src: resolvePath(
        'src/extension/webview-api/chat-context-processor/models/**'
      ),
      dest: resolveExtensionDistPath('models/')
    },

    // copy fix-packages to node_modules
    {
      src: resolvePath('scripts/fix-package/@xenova/transformers/**'),
      dest: resolvePath('node_modules/@xenova/transformers/src/')
    },
    {
      src: resolvePath('scripts/fix-package/onnxruntime-node/**'),
      dest: resolvePath('node_modules/onnxruntime-node/dist/')
    }
  ]

  const promises = targets.map(async ({ src, dest }) => {
    await cpy(src, dest, {
      cwd: dir,
      overwrite: true
    })
  })

  await Promise.all(promises)
}
