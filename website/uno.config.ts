import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      unit: 'em'
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'Jet Brains Mono'
      }
    })
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  include: ['./**/*.vue', './**/*.md']
})
