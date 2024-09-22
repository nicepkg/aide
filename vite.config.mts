import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import vscode from '@tomjs/vite-plugin-vscode'
import react from '@vitejs/plugin-react'
import cpy from 'cpy'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import pkg from './package.json'

const dir =
  typeof __dirname === 'string'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))

const resolvePath = (...paths: string[]) => path.resolve(dir, ...paths)

const extensionDistPath = resolvePath('dist/extension')

const define: Record<string, string> = {
  __EXTENSION_DIST_PATH__: JSON.stringify(extensionDistPath)
}

// https://vitejs.dev/config/
export default defineConfig(() => {
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
          async onSuccess() {
            await tsupCopyFiles()
          }
          // esbuildOptions(options) {
          //   options.alias = {
          //     'vectordb/native': resolvePath(
          //       'scripts/fix-package/vectordb/native.js'
          //     )
          //   }
          // },
          // esbuildPlugins: [
          //   {
          //     name: 'handle-native-node-modules',
          //     setup(build) {
          //       build.onResolve({ filter: /\.node$/ }, args => ({
          //         path: path.resolve(args.resolveDir, args.path),
          //         external: true
          //       }))
          //     }
          //   }
          // ]
        }
      })
    ],
    build: {
      commonjsOptions: {
        ignoreDynamicRequires: true,
        dynamicRequireRoot: '/',
        dynamicRequireTargets: ['./bin/napi-v3/**/onnxruntime_binding.node']
      }
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        // hack onnxruntime-node
        'onnxruntime-node': path.join(
          __dirname,
          'vendors/onnxruntime-node/index.cjs'
        )
      }
    }
  }
})

const tsupCopyFiles = async () => {
  const targets = [
    {
      src: 'node_modules/tree-sitter-wasms/out/*.wasm',
      dest: 'tree-sitter-wasms/'
    },
    {
      src: 'node_modules/web-tree-sitter/*.wasm',
      dest: './'
    },
    {
      src: 'node_modules/onnxruntime-node/bin/**',
      dest: 'onnxruntime/'
    },
    {
      src: 'node_modules/@lancedb/**',
      dest: 'node_modules/@lancedb/'
    },
    {
      src: 'src/extension/webview-api/chat-context-processor/models/**',
      dest: 'models/'
    }
  ]

  const promises = targets.map(async ({ src, dest }) => {
    const srcPath = resolvePath(src)
    const destPath = path.join(extensionDistPath, dest)

    await cpy(srcPath, destPath, {
      cwd: dir
    })
  })

  await Promise.all(promises)
}
