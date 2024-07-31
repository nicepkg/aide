# Ask AI With Custom Command

Command Name: `aide.askAI`

Prepare and execute a custom AI command based on the selected file and user input.

**Usage:**

- Select a file or folder in the explorer. (Multi-select: hold `Ctrl` or `Cmd` and click on files or folders)
- Right-click and select `✨ Aide: Ask AI`.
- Follow the prompt to enter your question.

<Video src="/videos/aide-ask-ai.mp4"/>

**Related Configuration:**

- You can customize the AI command by modifying the [`aide.aiCommand`](../configuration/ai-command.md) configuration.

- You can control whether to copy the AI command before execution by modifying the [`aide.aiCommandCopyBeforeRun`](../configuration/ai-command-copy-before-run.md) configuration.

- You can control whether to automatically run the AI command by modifying the [`aide.aiCommandAutoRun`](../configuration/ai-command-auto-run.md) configuration.

- You can ignore specific files or folders by modifying the [`aide.ignorePatterns`](../configuration/ignore-patterns.md) configuration.

- You can control whether to ignore files or folders specified in the `.gitignore` file by modifying the [`aide.respectGitIgnore`](../configuration/respect-git-ignore.md) configuration.
