import {
  defineConfig,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      unit: 'em'
    })
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  content: {
    pipeline: {
      include: ['./**/*.vue', './**/*.md']
    }
  }
})
