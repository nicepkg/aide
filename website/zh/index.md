---
layout: home

title: Aide
titleTemplate: 在 VSCode 里掌握任何屎山代码

hero:
  name: Aide
  image: /logo.svg
  text: '在 VSCode 里掌握任何屎山代码 💪'
  tagline: '一键注释和语言转换。'
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started/
    - theme: alt
      text: 安装
      link: /zh/guide/getting-started/installation
    - theme: alt
      text: 为什么选 Aide?
      link: /zh/guide/getting-started/#为什么选择-aide
    - theme: alt
      text: 在 Github 上查看
      link: https://github.com/nicepkg/aide
---

<div>
  <Video src="/videos/aide-intro.mp4" />
</div>

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #8c6bef 30%, #ef7b95);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #8c6bef 50%, #ef7b95 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
