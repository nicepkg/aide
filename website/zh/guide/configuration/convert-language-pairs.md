# aide.convertLanguagePairs

此配置允许你自定义==代码转换的语言映射==。映射应采用 `sourceLanguage: targetLanguage` 的形式。

默认情况下，编辑器会在当前项目 `.vscode/settings.json` 文件中记住你的语言映射，位于 `aide.convertLanguagePairs` 配置下。你可以在这里修改或添加新的语言映射，例如：

```json
{
  //其他设置...
  "aide.convertLanguagePairs": {
    "javascript": "python", // 将 javascript 转换为 python
    "json": "yaml", // 将 json 转换为 yaml
    "vue": "vue vue2 转 vue3 <script setup> 写法" // 将 vue 转换成 vue
    // 解析为：
    //    转换后的语言：vue
    //    补充描述：vue2 文件迁移到 vue3 <script setup> 写法
    // 规则为：目标语言 + 空格 + 补充描述
  }
}
```

你的语言名称应遵循 [==VSCode 语言标识符==](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers)，以下是一些你可能需要的 VSCode 语言标识符：

::: details VSCode 语言标识符列表

- abap
- bat
- bibtex
- clojure
- coffeescript
- c
- cpp
- csharp
- dockercompose
- css
- cuda-cpp
- d
- pascal
- diff
- dockerfile
- erlang
- fsharp
- git-commit
- git-rebase
- go
- groovy
- handlebars
- haml
- haskell
- html
- ini
- java
- javascript
- javascriptreact
- json
- jsonc
- julia
- latex
- less
- lua
- makefile
- markdown
- objective-c
- objective-cpp
- ocaml
- perl
- perl6
- php
- plaintext
- powershell
- jade
- pug
- python
- r
- razor
- ruby
- rust
- scss
- sass
- shaderlab
- shellscript
- slim
- sql
- stylus
- svelte
- swift
- typescript
- typescriptreact
- tex
- vb
- vue
- vue-html
- xml
- xsl
- yaml

:::

::: tip 提示
如果在列表中找不到你的语言，你可以随意自定义你的语言标识符。但是这意味着你可能无法获得语法高亮，仅此而已。
:::
