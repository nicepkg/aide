export interface Integration {
  icon: string
  name: string
  link: string
  target?: string
  secondary?: string
}

// @unocss-include

export const integrations: Integration[] = [
  {
    name: 'Vue',
    link: '/guide/getting-started/integrations/vue',
    icon: 'i-logos-vue'
  },
  {
    name: 'Nuxt',
    link: '/guide/getting-started/integrations/nuxt',
    icon: 'i-logos-nuxt-icon'
  },
  {
    name: 'TailWind',
    secondary: 'Upvote Issue',
    target: '_blank',
    link: 'https://github.com/jd-solanki/anu/issues/128',
    icon: 'i-logos-tailwindcss-icon'
  }
]
