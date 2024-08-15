# Expert Code Enhancer

Command Name: `aide.expertCodeEnhancer`

Use AI to optimize and refactor the entire file or selected code. Supports multiple programming languages.

::: warning Warning

This feature sometimes requires AI models that support the `function_call` capability.

:::

**Scenarios:**

- When inheriting a legacy project, you want to optimize hard-to-read code.
- Helps you clean up and refactor legacy code to make it more readable.
- You want to improve your own coding skills.
- Helps you refactor code following principles like SOLID and DRY.
- Automatically applies appropriate design patterns to your code.
- Automatically checks and fixes security vulnerabilities in your code.
- Automatically detects and optimizes performance issues in your code.
- Allows custom AI optimization prompts for specific files, replacing many traditional code handling scripts.

**Usage:**

- Select the code in the editor.
- Click the pencil icon at the top right or right-click and select `✨ Aide: Expert Code Enhancer`.

::: tip
If the output is interrupted, you can click the original pencil icon or right-click and select `✨ Aide: Expert Code Enhancer` to continue.
:::

<Video src="/videos/aide-expert-code-enhancer.mp4"/>

**Related Configuration:**

- You can customize the corresponding AI prompt templates by configuring [`aide.expertCodeEnhancerPromptList`](../configuration/expert-code-enhancer-prompt-list.md).
