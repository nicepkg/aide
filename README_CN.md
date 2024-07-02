<div align="center">
<img src="https://github.com/2214962083/2214962083/assets/35005637/f7a42850-0b23-45fc-9b33-bf1173e1319d" alt="icon"/>

<h1 align="center">Aide</h1>

[English 🌏](https://github.com/nicepkg/aide/tree/master/README.md) / 简体中文

一键将选定文件复制为 AI 提示, 支持自定义 AI 命令以针对这些文件发起聊天。🚀

[![Version](https://img.shields.io/visual-studio-marketplace/v/nicepkg.aide-pro)](https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/nicepkg.aide-pro)](https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/nicepkg.aide-pro)](https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro)
[![License](https://img.shields.io/github/license/nicepkg/aide)](https://github.com/nicepkg/aide/blob/master/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/nicepkg/aide)](https://github.com/nicepkg/aide)

</div>

## 为什么选择 Aide 🤷‍♂️

- **🚀 提高效率:** 一键将选定文件转换为 AI 提示，节省大量手动复制粘贴的时间。
- **🧠 智能交互:** 自定义 AI 命令，直接与代码文件对话，获得量身定制的建议和答案。
- **🛠 灵活定制:** 高度可配置的提示模板和 AI 命令，适应你的个性化工作流程。
- **🔍 深度集成:** 与 VS Code 无缝集成，使 AI 辅助编程成为日常开发的一部分。
- **🌟 开源且免费:** 完全开源，持续更新，由社区驱动的创新工具。
- **📈 质量提升:** 利用 AI 力量提高代码质量，加速问题解决。
- **🎓 学习助手:** 对初学者友好，帮助你更好地理解和改进代码。
- **🌐 跨语言支持:** 适用于各种编程语言和项目类型。

无论你是经验丰富的开发者还是编码新手，Aide 都可以成为你强大的助手，大幅提升你的编程体验和工作效率。立即尝试，体验 AI 驱动编程的新时代！

## 功能 ✨

- 📋 将选定文件复制为 AI 提示
- 💬 使用自定义命令向 AI 询问选定文件
- 🎛 可定制的 AI 提示模板
- 📁 支持选定多个文件和文件夹
- 🚫 自定义文件忽略规则，用于排除文件

## 安装 📦

1. 打开 Visual Studio Code
2. 进入扩展 (Ctrl+Shift+X)
3. 搜索 “[Aide](https://marketplace.visualstudio.com/items?itemName=nicepkg.aide-pro)”
4. 点击安装

## 使用方法 🛠

### 复制为提示

1. 在资源管理器中选择一些文件或文件夹并右键点击
2. 选择 `✨ Aide: 复制为 AI Prompt`
3. 文件内容将以配置的格式复制到剪贴板

### 向 AI 询问

1. 在资源管理器中选择一些文件或文件夹并右键点击
2. 选择 `✨ Aide: 问 AI`
3. 如果出现提示，输入你的问题
4. 配置的 AI 命令将与选定文件路径一起执行

例如：

- 使用 [aider (一个广受好评的 AI 命令行工具)](https://github.com/paul-gauthier/aider) 来配置 `aide.aiCommand`:

```bash
aider #{filesAbsolutePath}
```

- 选择 `a.ts` 和 `b.ts` 并运行 `✨ Aide: Ask AI`:

```bash
aider "/xxxx/your-project/a.ts" "/xxxx/your-project/b.ts"
```

## 配置 ⚙️

可以通过 VS Code 设置自定义 Aide:

- `aide.aiPrompt`: AI 提示模板 (默认: `#{content}`)

  - 例如: 你自定义 aiPrompt 模板为 `这是我的文件内容: #{content} 请回答问题:`.
  - 然后选择 `a.ts` 和 `b.ts` 并运行 `✨ Aide: Copy As AI Prompt`:
  - 你将得到:

    ````txt
    这是我的文件内容:
    文件: a.ts
    ```ts
    // a.ts 内容

    ```

    文件: b.ts
    ```ts
    // b.ts 内容

    ```
    请回答问题:
    ````

- `aide.aiCommand`: AI 命令执行模板 (默认: "")

  - `#{filesRelativePath}`: 选定文件的相对路径
  - `#{filesAbsolutePath}`: 选定文件的绝对路径
  - `#{question}`: 用户输入的问题，这将显示一个提示以询问问题

- `aide.aiCommandCopyBeforeRun`: 在执行前复制 AI 命令 (默认: `true`)
- `aide.ignorePatterns`: 支持[glob](https://github.com/isaacs/node-glob)规则，忽略的文件规则集合，默认:
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

## 贡献 🤝

欢迎贡献！请随时提交拉取请求。有关详细信息，请参阅 [贡献指南](CONTRIBUTING.md)。

这个项目的存在感谢所有贡献者：

<a href="https://github.com/nicepkg/aide/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=nicepkg/aide" />
</a>

## 许可证 📄

此项目根据 MIT 许可证授权 - 有关详细信息，请参阅 [LICENSE](LICENSE) 文件。

## 支持 💖

如果你觉得这个项目有帮助，请考虑在 [GitHub](https://github.com/nicepkg/aide) 上给它一个 ⭐️！

## Star 历史 ⭐

<div align="center">

<img src="https://api.star-history.com/svg?repos=nicepkg/smart-web&type=Date" width="600" height="400" alt="Star History Chart" valign="middle">

</div>
