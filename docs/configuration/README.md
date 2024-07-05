## Aide Configuration Documentation

To customize Aide's settings and tailor it to your workflow, follow these steps to access its configuration area:

1. Open the Settings editor:

   - Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (macOS)
   - Or click on the gear icon in the lower-left corner of the window to open the Settings menu. From the dropdown menu, select "Settings"

2. In the Settings window, type "aide" in the search bar at the top.You should now see all Aide-specific settings in the main panel.

### `✨ Aide: Copy As AI Prompt`

This command copies selected files' contents into the clipboard, formatted as a prompt for AI interaction.

You can select some files or folders in the Explorer and right-click, then select `✨ Aide: Copy As AI Prompt`. The file content will be copied to your clipboard in the configured format.

#### Configuration - `aide.aiPrompt`

This setting allows you to specify the template for AI prompts. The template can include some placeholders:

**Template Parameters:**

| Parameter    | Description                               | Usage Example                                                                                                         |
| ------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `#{content}` | Placeholder for the full content of files | <pre><code>File: example.js<br/>\`\`\`js<br/>const bar = "hello, aide";<br/>console.log(bar);<br/>\`\`\`</code></pre> |

**Usage Examples:**

- **Default Template:**

  ```plaintext
  #{content}
  ```

- **Case Example:**
  ```plaintext
  Here is the code snippet:
  #{content}
  Please answer the following question:
  ```

#### Configuration - `aide.ignorePatterns`

This setting allows you to specify file patterns to exclude from the AI prompt. Supports [glob](https://github.com/isaacs/node-glob) rules.

- **Default Value:**

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

- **Usage Example:**

  For example, to exclude the `node_modules`, `.git`, `dist`, and `build` folders from the AI prompt, you can update the setting as follows:

  ```json
  {
    "aide.ignorePatterns": ["**/node_modules", "**/.git", "**/dist", "**/build"]
  }
  ```

---

### `✨ Aide: Ask AI`

This command prepares a custom AI command based on selected files and user input, then executes the command.

You can select some files or folders in the Explorer and right-click, then select `✨ Aide: Ask AI`. If prompted, enter your question. The configured AI command will be executed with the selected files path.

#### Configuration - `aide.aiCommand`

This setting allows you to specify the template for the AI command execution. The template can include some placeholders:

**Template Parameters:**

| Parameter              | Description                               | Usage Example                                                                                                         |
| ---------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `#{filesRelativePath}` | Placeholder for files' relative paths     | `"./src/index.ts" "./src/utils.ts"`                                                                                   |
| `#{filesFullPath}`     | Placeholder for files' full paths         | `"/project/src/index.ts" "/project/src/utils.ts"`                                                                     |
| `#{question}`          | Placeholder for user input question       | `"What is the purpose of this code? "`                                                                                |
| `#{content}`           | Placeholder for the full content of files | <pre><code>File: example.js<br/>\`\`\`js<br/>const bar = "hello, aide";<br/>console.log(bar);<br/>\`\`\`</code></pre> |

**Usage Examples:**

- **Default Template:**

  Empty, you need to provide a custom template.

- **Case Example:**

  Recommended use [aider (A widely acclaimed command line tool for AI)](https://github.com/paul-gauthier/aider) command to ask AI about the selected files:

  ```plaintext
  aider #{filesRelativePath}
  ```

#### Configuration - `aide.aiCommandCopyBeforeRun`

This setting allows you to specify whether to copy the AI command before execution.

- **Default Value:**

  ```json
  {
    "aide.aiCommandCopyBeforeRun": true
  }
  ```

#### Configuration - `aide.ignorePatterns`

The same as the `✨ Aide: Copy As AI Prompt` command's `aide.ignorePatterns` configuration.

This setting allows you to specify file patterns to exclude from the AI prompt. Supports [glob](https://github.com/isaacs/node-glob) rules.

---

### `✨ Aide: Code Convert`

This command converts the selected code from one programming language to another using AI.

You can click on a paper-like icon in the top right corner of VS Code or right-click in the editor and select `✨ Aide: Code Convert`. You can also select specific code snippets and execute the above operations.

vscode will open a temporary text to show you the converted code.

#### Configuration - `aide.convertLanguagePairs`

This setting allows you to specify the language mapping for code conversion. The mapping should be in the form of `sourceLanguage: targetLanguage`.

By default, the editor will remember your language mapping in the `.vscode/settings.json` file under the `aide.convertLanguagePairs` configuration. You can modify or add new language mappings here, such as:

```json
{
  //other settings...
  "aide.convertLanguagePairs": {
    "javascript": "python", // Convert javascript to python
    "json": "yaml" // Convert json to yaml
  }
}
```

Your language name should follow [VSCode Language Identifiers](https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers), here are some VSCode Language Identifiers you may need:

<details>
<summary>VSCode Language Identifiers List</summary>

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

This command adds comments to the selected code to make it readable for beginners, using AI.

Sometimes even senior developers can't understand a pile of code at once. At this time, you need some comments to help you understand. This command is to add comments to the code as much as possible to make it easier to understand.

You can click on a book-like icon in the top right corner of VS Code or right-click in the editor and select `✨ Aide: Code Viewer Helper`. You can also select specific code snippets and execute the above operations.

vscode will open a temporary text to show you the commented code.

#### Configuration - `aide.codeViewerHelperPrompt`

This setting allows you to specify the template for the code viewer helper prompt. The template can include some placeholders:

**Template Parameters:**

| Parameter           | Description                                | Usage Example                                                                              |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `#{sourceLanguage}` | Placeholder for the source code language   | `javascript`                                                                               |
| `#{locale}`         | Placeholder for the user's locale/language | `en`                                                                                       |
| `#{content}`        | Placeholder for the full content of files  | <pre lang="javascript"><code>const bar = "hello, aide";<br/>console.log(bar);</code></pre> |

**Usage Examples:**

- **Default Template:**

  ```plaintext
  You are a programming language commentator.
  You need to help me add comments to #{sourceLanguage} code as much as possible to make it readable for beginners.
  Do not change the original code, just add as detailed comments as possible, because my purpose is only to understand and read.
  Please use my native language #{locale} as the commenting language.
  Please do not reply with any text other than the code, and do not use markdown syntax.
  Here is the code you need to comment on:
  #{content}
  ```

- **Case Example:**
  ```plaintext
  Provide detailed comments for the following #{sourceLanguage} code, using #{locale}:
  #{content}
  ```

---

### OpenAI Configuration

#### Configuration - `aide.openaiKey`

This setting allows you to specify your OpenAI API key. You can get your API key from the [OpenAI website](https://platform.openai.com)

- **Default Value:**

  ```json
  {
    "aide.openaiKey": ""
  }
  ```

#### Configuration - `aide.openaiModel`

This setting allows you to specify the [OpenAI model](https://platform.openai.com/docs/models) to use for AI interactions.

- **Default Value:**

  ```json
  {
    "aide.openaiModel": "gpt-4o"
  }
  ```

#### Configuration - `aide.openaiBaseUrl`

This setting allows you to specify the base URL for the OpenAI API.

- **Default Value:**

  ```json
  {
    "aide.openaiBaseUrl": "https://api.openai.com/v1"
  }
  ```

---

## Customizing Keyboard Shortcuts

The commands marked with ✨ above are built-in commands of the Aide VSCode extension. It allows you to customize keyboard shortcuts to invoke these commands, which can improve your productivity in VSCode.

You can customize keyboard shortcuts for the commands in this extension to streamline your workflow. Follow these steps to set up your preferred shortcuts:

1. Open the Keyboard Shortcuts editor:

   - Press `Ctrl+K Ctrl+S` (Windows/Linux) or `Cmd+K Cmd+S` (Mac)
   - Or go to File > Preferences > Keyboard Shortcuts

2. In the Keyboard Shortcuts editor, search for the command you want to customize:

   - "Aide: Copy as Prompt"
   - "Aide: Ask AI"
   - "Aide: Code Convert"
   - "Aide: Code Viewer Helper"
   - ...maybe more

3. Click on the plus icon next to the command you want to assign a shortcut to.

4. Press the desired key combination for your new shortcut.

5. If there's a conflict with an existing shortcut, VSCode will notify you. You can choose to overwrite the existing shortcut or try a different combination.

Here are the default commands you can customize:

- `aide.copyAsPrompt`: Copy as Prompt
- `aide.askAI`: Ask AI
- `aide.codeConvert`: Code Convert
- `aide.codeViewerHelper`: Code Viewer Helper
- ...maybe more

Example:
To set `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac) for the "Ask AI" command:

1. Search for "Aide:Ask AI" in the Keyboard Shortcuts editor
2. Click the plus icon next to the "aide.askAI" command
3. Press `Ctrl+Shift+A` or `Cmd+Shift+A`
4. The new shortcut will be saved automatically

Repeat this process for any other commands you wish to customize.

Note: If you prefer to edit the `keybindings.json` file directly, you can add entries like this:

```json
{
  "key": "ctrl+shift+a",
  "command": "aide.askAI",
  "when": "editorTextFocus"
}
```

Replace `"ctrl+shift+a"` with your desired key combination and `"aide.askAI"` with the command you want to assign.

By customizing these shortcuts, you can quickly access the extension's features and improve your productivity in VSCode.
