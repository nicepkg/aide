# aide.convertLanguagePairs

This configuration allows you to customize ==the language mapping for code conversion==. The mapping should be in the form of `sourceLanguage: targetLanguage`.

By default, the editor will remember your language mapping in the current project's `.vscode/settings.json` file, under the `aide.convertLanguagePairs` configuration. You can modify or add new language mappings here, for example:

```json
{
  //other settings...
  "aide.convertLanguagePairs": {
    "javascript": "python", // Convert javascript to python
    "json": "yaml", // Convert json to yaml
    "vue": "vue migrate from vue2 to vue3 <script setup> syntax" // Convert vue to vue
    // Parsed as:
    //    Target language: vue
    //    Additional description: migrate from vue2 to vue3 <script setup> syntax
    // Rule: target language + space + additional description
  }
}
```

Your language names should follow the [==VSCode Language Identifiers==](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers). Here are some VSCode language identifiers you might need:

::: details List of VSCode Language Identifiers

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

::: tip
If you can't find your language in the list, you can freely customize your language identifier. However, this means you might not get syntax highlighting, that's all.
:::
