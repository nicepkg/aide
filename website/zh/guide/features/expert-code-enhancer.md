# 让大师帮你改代码

命令名称: `aide.expertCodeEnhancer`

使用 AI 优化和重构整个文件或选定的代码。支持多种编程语言。

::: warning 警告

该功能有时需要 AI 模型支持 `function_call` 功能

:::

**使用场景：**

- 接手遗留项目时，你希望优化难以阅读的代码。
- 它能帮助你清理并重构遗留代码，使其更易读。
- 你希望提升自己的编码水平。
- 它能帮助你重构代码，遵循 SOLID、DRY 等编码原则。
- 它能自动为你的代码应用合适的设计模式。
- 它能自动检查并修复代码中的安全漏洞。
- 它能自动检测并优化代码的性能问题。
- 你可以针对特定文件自定义 AI 优化提示词，替代许多传统的代码处理脚本。

**使用方法：**

- 在编辑器中选择代码。
- 点击右上角的铅笔图标或右键选择 `✨ Aide: 让大师帮你改代码`。

::: tip 提示
如果输出中断，可以点击原来的铅笔图标或右键选择 `✨ Aide: 让大师帮你改代码`以便继续。
:::

<Video src="/videos/aide-expert-code-enhancer.mp4"/>

**相关配置：**

- 你可以通过配置 [`aide.expertCodeEnhancerPromptList`](../configuration/expert-code-enhancer-prompt-list.md) 来自定义相应的 AI 提示词列表。
