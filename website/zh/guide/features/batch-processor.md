# AI 批量处理文件

命令名称: `aide.batchProcessor`

使用 AI 将选中的多个文件代码根据你的需求处理。

**它能做的：**

- 批量加上详细注释
- 批量优化代码
- 批量将 `vue2` 代码转换为 `vue3` 代码
- 批量将 `vue` 代码转换为 `react` 代码
- 批量将 `react` 代码转换为 `flutter` 代码
- 批量将 `react class component` 代码转换为 `react function component` 代码
- 批量将 `rust` 代码转换为 `js` 代码
- 批量将 `json` 代码转换为 `yaml` 代码
- 发挥想像力..

**它不能做的：**

- 具体的业务需求
- 一个文件拆分成多个文件

**==放心！处理并不会修改源文件==：**

- 它会额外生成`文件副本`。比如 `app/index.py` -> `app/index.py.aide.py`。
- 你可以点击`文件副本`，审查无误后再决定是否替换`源文件`。
- 打开`文件副本`时会同时打开`源文件`，以便你可以随时对比。
- 你可以点击`文件副本`第一行的 `替换原文` 按钮来替换`源文件`。

**使用方法：**

- 在资源管理器中选择文件或文件夹。(多选方法：按住 `Ctrl` 或 `Cmd` 并点击文件或文件夹)
- 右键选择 `✨ Aide: AI 批量处理文件`。
- 输入您的代码加工处理要求。

::: warning 警告

该功能需要 AI 模型支持 `function_call` 功能

:::

<Video src="/videos/aide-batch-processor.mp4"/>

::: tip 提示

1. 对于长文件代码可能会面临输出中断问题，目前没有好的解决方法。
2. 请认真审查处理后的文件，确保无误后再替换源文件。永远不要相信 AI 处理的代码是无误的。

:::

**相关配置：**

- 你可以通过修改 [`aide.apiConcurrency`](../configuration/api-concurrency.md) 配置来自定义 AI 请求并发数。
