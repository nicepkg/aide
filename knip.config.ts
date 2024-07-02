import type { KnipConfig } from 'knip'

const defineConfig = (config: KnipConfig) => config

export default defineConfig({
  entry: ['src/index.tsx', '*.config.cjs', '*.config.mts'],
  project: ['src/**/*.{ts,tsx}', 'scripts/*.ts'],
  ignore: ['**/define/**/*.ts', '**/*.d.ts'],
  ignoreDependencies: ['virtual:*', '~icons/']
})
