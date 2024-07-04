<div align="center">

<h1 align="center">Aide</h1>

English / [简体中文 🌏](https://github.com/nicepkg/aide/tree/master/README_CN.md)

Convert selected files to AI prompts with one click, enabling custom AI commands to initiate inquiries about these files. 🚀

一键将选定文件复制为 AI 提示,支持自定义 AI 命令以针对这些文件发起聊天。🚀

[![Version](https://img.shields.io/visual-studio-marketplace/v/nicepkg.aide-pro)](https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/nicepkg.aide-pro)](https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/nicepkg.aide-pro)](https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro)
[![License](https://img.shields.io/github/license/nicepkg/aide)](https://github.com/nicepkg/aide/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/nicepkg/aide)](https://github.com/nicepkg/aide)

</div>

## Features ✨

- 📋 Copy selected files as AI prompts
- 💬 Ask AI about selected files with custom commands
- 🎛 Customizable AI prompt template
- 📁 Support selected multiple files and folders
- 🚫 Custom ignore patterns for excluding files

## Installation 📦

1. Open Visual Studio Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "[Aide](https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro)"
4. Click Install

## Usage 🛠

### Copy as Prompt

1. Select some files or folders in the Explorer and right-click
2. Select `✨ Aide: Copy As AI Prompt`
3. The file content will be copied to your clipboard in the configured format

### Ask AI

1. Select some files or folders in the Explorer and right-click
2. Select `✨ Aide: Ask AI`
3. If prompted, enter your question
4. The configured AI command will be executed with the selected files path

For example:

- Configure `aide.aiCommand` with [aider (A widely acclaimed command line tool for AI)](https://github.com/paul-gauthier/aider):

```bash
aider #{filesAbsolutePath}
```

- Select `a.ts` and `b.ts` and run `✨ Aide: Ask AI`:

```bash
aider "/xxxx/your-project/a.ts" "/xxxx/your-project/b.ts"
```

## Configuration ⚙️

Aide can be customized through VS Code settings:

- `aide.aiPrompt`: Template for AI prompts (default: `#{content}`)

  - For Example: you custom aiPrompt template as `This is my files content: #{content} Please answer the question:`.
  - then select `a.ts` and `b.ts` and run `✨ Aide: Copy As AI Prompt`:
  - You will got:

    ````txt
    This is my files content:
    File: a.ts
    ```ts
    // a.ts content

    ```

    File: b.ts
    ```ts
    // b.ts content

    ```
    Please answer the question:
    ````

- `aide.aiCommand`: Template for AI command execution (default: "")

  - `#{filesRelativePath}`: Selected files relative path
  - `#{filesAbsolutePath}`: Selected files absolute path
  - `#{question}`: User input question, this will show a prompt to ask for a question

- `aide.aiCommandCopyBeforeRun`: Copy AI command before execution (default: `true`)
- `aide.ignorePatterns`: Supports [glob](https://github.com/isaacs/node-glob) rules, ignored file rule sets, default:
  ```json
  [
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
  ```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. See the [contributing guide](CONTRIBUTING.md) for more details.

This project exists thanks to all the people who contribute:

<a href="https://github.com/nicepkg/aide/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=nicepkg/aide" />
</a>

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support 💖

If you find this project helpful, please consider giving it a ⭐️ on [GitHub](https://github.com/nicepkg/aide)!

## Star History ⭐

<div align="center">

<img src="https://api.star-history.com/svg?repos=nicepkg/smart-web&type=Date" width="600" height="400" alt="Star History Chart" valign="middle">

</div>
