## Aide 配置文档

要自定义 Aide 的设置并根据你的工作流程进行调整，请按照以下步骤访问其配置区域：

1. 打开设置编辑器：

   - 按 `Ctrl+,`（Windows/Linux）或 `Cmd+,`（macOS）
   - 或者点击窗口左下角的齿轮图标打开设置菜单。从下拉菜单中选择“设置”

2. 在设置窗口中，在顶部的搜索栏输入“aide”。现在你应该可以在主面板中看到所有 Aide 特定的设置。

### `✨ Aide: Copy As AI Prompt`

此命令将所选文件的内容复制到剪贴板，格式化为 AI 交互提示。

你可以在资源管理器中选择一些文件或文件夹，右键点击，然后选择 `✨ Aide: Copy As AI Prompt`。文件内容将以配置的格式复制到你的剪贴板。

#### 配置 - `aide.aiPrompt`

此设置允许你指定 AI 提示的模板。模板可以包括一些占位符：

**模板参数：**

| 参数         | 描述                 | 使用示例                                                                                                              |
| ------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `#{content}` | 文件的完整内容占位符 | <pre><code>File: example.js<br/>\`\`\`js<br/>const bar = "hello, aide";<br/>console.log(bar);<br/>\`\`\`</code></pre> |

**使用示例：**

- **默认模板：**

  ```plaintext
  #{content}
  ```

- **示例：**
  ```plaintext
  Here is the code snippet:
  #{content}
  Please answer the following question:
  ```

#### 配置 - `aide.ignorePatterns`

此设置允许你指定要从 AI 提示中排除的文件模式。支持 [glob](https://github.com/isaacs/node-glob) 规则。

- **默认值：**

  ```json
  {
    "aide.ignorePatterns": [
      "**/node_modules",
      "**/.git",
      "**/__pycache__",
      "**/.Python",
      "**/.DS_Store",
      "**/.cache",
      "**/.next",
      "**/.nuxt",
      "**/.out",
      "**/dist",
      "**/.serverless",
      "**/.parcel-cache"
    ]
  }
  ```

- **使用示例：**

  例如，要从 AI 提示中排除 `node_modules`、`.git`、`dist` 和 `build` 文件夹，可以更新设置如下：

  ```json
  {
    "aide.ignorePatterns": ["**/node_modules", "**/.git", "**/dist", "**/build"]
  }
  ```

---

### `✨ Aide: Ask AI`

此命令根据所选文件和用户输入准备自定义 AI 命令，然后执行该命令。

你可以在资源管理器中选择一些文件或文件夹，右键点击，然后选择 `✨ Aide: Ask AI`。如果出现提示，请输入你的问题。配置的 AI 命令将与所选文件路径一起执行。

#### 配置 - `aide.aiCommand`

此设置允许你指定 AI 命令执行的模板。模板可以包括一些占位符：

**模板参数：**

| 参数                   | 描述                 | 使用示例                                                                                                              |
| ---------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `#{filesRelativePath}` | 文件相对路径占位符   | `"./src/index.ts" "./src/utils.ts"`                                                                                   |
| `#{filesFullPath}`     | 文件完整路径占位符   | `"/project/src/index.ts" "/project/src/utils.ts"`                                                                     |
| `#{question}`          | 用户输入问题的占位符 | `"What is the purpose of this code?" `                                                                                |
| `#{content}`           | 文件的完整内容占位符 | <pre><code>File: example.js<br/>\`\`\`js<br/>const bar = "hello, aide";<br/>console.log(bar);<br/>\`\`\`</code></pre> |

**使用示例：**

- **默认模板：**

  空白，你需要提供一个自定义模板。

- **示例：**

  推荐使用 [aider (一个广受好评的命令行 AI 工具)](https://github.com/paul-gauthier/aider) 命令来询问 AI 关于所选文件的问题：

  ```plaintext
  aider #{filesRelativePath}
  ```

#### 配置 - `aide.aiCommandCopyBeforeRun`

此设置允许你指定在执行之前是否复制 AI 命令。

- **默认值：**

  ```json
  {
    "aide.aiCommandCopyBeforeRun": true
  }
  ```

#### 配置 - `aide.ignorePatterns`

与 `✨ Aide: Copy As AI Prompt` 命令的 `aide.ignorePatterns` 配置相同。

此设置允许你指定要从 AI 提示中排除的文件模式。支持 [glob](https://github.com/isaacs/node-glob) 规则。

---

### `✨ Aide: Code Convert`

此命令使用 AI 将所选代码从一种编程语言转换为另一种编程语言。

你可以点击 VSCode 右上角的纸片图标，或在编辑器中右键点击并选择 `✨ Aide: Code Convert`。你也可以选择特定的代码片段并执行上述操作。

VSCode 将打开一个临时文本以显示转换后的代码。

#### 配置 - `aide.convertLanguagePairs`

此设置允许你指定代码转换的语言映射。映射应采用 `sourceLanguage: targetLanguage` 的形式。

默认情况下，编辑器会在 `.vscode/settings.json` 文件中记住你的语言映射，位于 `aide.convertLanguagePairs` 配置下。你可以在这里修改或添加新的语言映射，例如：

```json
{
  //其他设置...
  "aide.convertLanguagePairs": {
    "javascript": "python", // 将 javascript 转换为 python
    "json": "yaml" // 将 json 转换为 yaml
  }
}
```

你的语言名称应遵循 [VSCode 语言标识符](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers)，以下是一些你可能需要的 VSCode 语言标识符：

<details>
<summary>VSCode 语言标识符列表</summary>

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

</details>

---

### `✨ Aide: Code Viewer Helper`

此命令使用 AI 为所选代码添加注释，使其对初学者更具可读性。

有时即使是高级开发人员也无法一次理解一堆代码。这时，你需要一些注释来帮助你理解。此命令旨在尽可能多地为代码添加注释，使其更易于理解。

你可以点击 VSCode 右上角的书本图标，或在编辑器中右键点击并选择 `✨ Aide: Code Viewer Helper`。你也可以选择特定的代码片段并执行上述操作。

VSCode 将打开一个临时文本以显示带注释的代码。

#### 配置 - `aide.codeViewerHelperPrompt`

此设置允许你指定代码查看助手提示的模板。模板可以包括一些占位符：

**模板参数：**

| 参数                | 描述                  | 使用示例                                                                                   |
| ------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| `#{sourceLanguage}` | 源代码语言占位符      | `javascript`                                                                               |
| `#{locale}`         | 用户的语言/区域占位符 | `en`                                                                                       |
| `#{content}`        | 文件的完整内容占位符  | <pre lang="javascript"><code>const bar = "hello, aide";<br/>console.log(bar);</code></pre> |

**使用示例：**

- **默认模板：**

  ```plaintext
  You are a programming language commentator.
  You need to help me add comments to #{sourceLanguage} code as much as possible to make it readable for beginners.
  Do not change the original code, just add as detailed comments as possible, because my purpose is only to understand and read.
  Please use my native language #{locale} as the commenting language.
  Please do not
  ```

reply with any text other than the code, and do not use markdown syntax.
Here is the code you need to comment on:
#{content}

````

- **示例：**
```plaintext
Provide detailed comments for the following #{sourceLanguage} code, using #{locale}:
#{content}
````

---

### OpenAI 配置

#### 配置 - `aide.openaiKey`

此设置允许您指定您的 OpenAI API 密钥。您可以从 [OpenAI 网站](https://platform.openai.com) 获取您的 API 密钥。

- **默认值:**

  ```json
  {
    "aide.openaiKey": ""
  }
  ```

#### 配置 - `aide.openaiModel`

此设置允许您指定用于 AI 交互的 [OpenAI 模型](https://platform.openai.com/docs/models)。

- **默认值:**

  ```json
  {
    "aide.openaiModel": "gpt-4o"
  }
  ```

#### 配置 - `aide.openaiBaseUrl`

此设置允许您指定 OpenAI API 的基础 URL。

- **默认值:**

  ```json
  {
    "aide.openaiBaseUrl": "https://api.openai.com/v1"
  }
  ```

---

## 自定义键盘快捷键

上述带有 ✨ 标记的命令是 Aide VSCode 扩展的内置命令。它允许你自定义键盘快捷键来调用这些命令，这可以提高你在 VSCode 中的生产力。

你可以自定义此扩展的命令的键盘快捷键以简化你的工作流程。按照以下步骤设置你喜欢的快捷键：

1. 打开键盘快捷键编辑器：

   - 按 `Ctrl+K Ctrl+S`（Windows/Linux）或 `Cmd+K Cmd+S`（Mac）
   - 或者转到 文件 > 首选项 > 键盘快捷键

2. 在键盘快捷键编辑器中，搜索你想要自定义的命令：

   - "Aide: Copy as Prompt"
   - "Aide: Ask AI"
   - "Aide: Code Convert"
   - "Aide: Code Viewer Helper"
   - ...也许更多

3. 点击你想要分配快捷键的命令旁边的加号图标。

4. 按下你新快捷键的所需组合。

5. 如果与现有快捷键冲突，VSCode 会通知你。你可以选择覆盖现有快捷键或尝试其他组合。

以下是你可以自定义的默认命令：

- `aide.copyAsPrompt`: Copy as Prompt
- `aide.askAI`: Ask AI
- `aide.codeConvert`: Code Convert
- `aide.codeViewerHelper`: Code Viewer Helper
- ...也许更多

**示例：**

为 "Ask AI" 命令设置 `Ctrl+Shift+A`（Windows/Linux）或 `Cmd+Shift+A`（Mac）：

1. 在键盘快捷键编辑器中搜索 "Aide: Ask AI"
2. 点击 "aide.askAI" 命令旁边的加号图标
3. 按下 `Ctrl+Shift+A` 或 `Cmd+Shift+A`
4. 新快捷键会自动保存

对你希望自定义的任何其他命令重复此过程。

注意：如果你更喜欢直接编辑 `keybindings.json` 文件，可以添加如下条目：

```json
{
  "key": "ctrl+shift+a",
  "command": "aide.askAI",
  "when": "editorTextFocus"
}
```

将 `"ctrl+shift+a"` 替换为你想要的键组合，将 `"aide.askAI"` 替换为你想要分配的命令。

通过自定义这些快捷键，你可以快速访问扩展的功能，提高你在 VSCode 中的生产力。
