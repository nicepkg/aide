# Copy Multiple Files As AI Prompt

Command Name: `aide.copyAsPrompt`

Copies the content of the selected files to the clipboard and formats it as AI interaction prompts.

**Usage:**

- Select files or folders in the explorer. (Multi-select: hold `Ctrl` or `Cmd` and click on files or folders)
- Right-click and select `✨ Aide: Copy as AI Prompt`.

<Video src="/videos/aide-copy-as-prompt.mp4"/>

**Related Configuration:**

- You can customize the AI prompt template by configuring [`aide.aiPrompt`](../configuration/ai-prompt.md).

- You can ignore specific files or folders by modifying the [`aide.ignorePatterns`](../configuration/ignore-patterns.md) configuration.

- You can control whether to ignore files or folders specified in the `.gitignore` file by modifying the [`aide.respectGitIgnore`](../configuration/respect-git-ignore.md) configuration.
