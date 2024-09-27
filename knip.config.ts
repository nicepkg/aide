import type { KnipConfig } from 'knip'

const defineConfig = (config: KnipConfig) => config

export default defineConfig({
  entry: [
    'src/webview/main.tsx',
    'src/webview/App.tsx',
    'src/webview/pages/**/*.tsx',
    'src/extension/index.ts',
    'scripts/**/*.ts',
    '*.config.cjs',
    '*.config.mts'
  ],
  project: ['src/**/*.{ts,tsx}', 'scripts/*.ts'],
  ignore: ['**/define/**/*.ts', '**/*.d.ts', 'website/**/*'],
  ignoreDependencies: ['virtual:*', '~icons/']
})
