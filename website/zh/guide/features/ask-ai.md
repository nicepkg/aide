# 自定义命令提问 AI

命令名称: `aide.askAI`

基于选定的文件和用户输入准备并执行自定义 AI 命令。

**使用方法：**

- 在资源管理器中选择文件或文件夹。(多选方法：按住 `Ctrl` 或 `Cmd` 并点击文件或文件夹)
- 右键选择 `✨ Aide: 问 AI`。
- 按提示输入您的问题。

<Video src="/videos/aide-ask-ai.mp4"/>

**相关配置：**

- 你可以通过修改 [`aide.aiCommand`](../configuration/ai-command.md) 配置来自定义 AI 命令。

- 你可以通过修改 [`aide.aiCommandCopyBeforeRun`](../configuration/ai-command-copy-before-run.md) 配置来控制是否在执行之前复制 AI 命令。

- 你可以通过配置 [`aide.aiCommandAutoRun`](../configuration/ai-command-auto-run.md) 来控制是否自动运行 AI 命令。

- 你可以通过修改 [`aide.ignorePatterns`](../configuration/ignore-patterns.md) 配置来忽略特定文件或文件夹。

- 你可以通过修改 [`aide.respectGitIgnore`](../configuration/respect-git-ignore.md) 配置来控制是否忽略 `.gitignore` 文件中指定的文件或文件夹。
