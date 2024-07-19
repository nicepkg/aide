# 智能代码转换

命令名称: `aide.codeConvert`

使用 AI 将整个文件或选定的代码从一种编程语言转换为另一种。支持任何语言。大部份语言支持高亮。

**使用方法：**

- 在编辑器中选择代码。
- 点击右上角的纸张图标或右键选择 `✨ Aide: 代码转换`。

::: tip 提示
如果输出中断，可以点击原来的纸张图标或右键选择 `✨ Aide: 代码转换`以便继续。
:::

<Video src="/videos/aide-code-convert.mp4"/>

**相关配置：**

- 默认情况下，编辑器会在当前项目 `.vscode/settings.json` 文件中记住你的语言映射，位于 [`aide.convertLanguagePairs`](../configuration/convert-language-pairs.md) 配置下, 以便下次转换对应的语言时不需要再次选择。

- 你可以通过修改 [`aide.autoRememberConvertLanguagePairs`](../configuration/auto-remember-convert-language-pairs.md) 配置来控制是否自动记住语言映射。
