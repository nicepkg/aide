# 批量复制文件为 AI 提示词

命令名称: `aide.copyAsPrompt`

将选定文件的内容复制到剪贴板，并格式化为 AI 交互提示。

**使用方法：**

- 在资源管理器中选择文件或文件夹。(多选方法：按住 `Ctrl` 或 `Cmd` 并点击文件或文件夹)
- 右键选择 `✨ Aide: 复制为 AI 提示词`。

<Video src="/videos/aide-copy-as-prompt.mp4"/>

**相关配置：**

- 你可以通过配置 [`aide.aiPrompt`](../configuration/ai-prompt.md) 来自定义 AI 提示词模板。

- 你可以通过修改 [`aide.ignorePatterns`](../configuration/ignore-patterns.md) 配置来忽略特定文件或文件夹。

- 你可以通过修改 [`aide.respectGitIgnore`](../configuration/respect-git-ignore.md) 配置来控制是否忽略 `.gitignore` 文件中指定的文件或文件夹。
