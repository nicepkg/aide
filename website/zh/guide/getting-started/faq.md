# 常见问题解答

## 连接超时或文件无响应

**问题描述**：使用代理的用户或位于中国大陆的用户可能会遇到连接超时错误。

**解决方案**：

1. **检查网络代理配置**：

   - 使用命令终端测试能否 `ping` 通 `openai.com`（或其他 `API Base URL`）。
     - 命令示例：`ping openai.com`。
     - 注意：浏览器能访问网站并不意味着命令终端也可以，可能需要单独为终端设置代理。
   - 设置环境变量 `HTTPS_PROXY`：
     - 示例：`http://127.0.0.1:7890`（若使用 ==clash== 代理，默认端口为 `7890`）。
     - 对于 ==clash== 用户，请确保启用了 `TUN` 功能。

2. **执行以下操作**：
   - 确认代理配置正确，如有需要可重启代理工具。
   - 尝试更换代理或检查网络连接。
   - 使用可正常访问的 `API Base URL`。

详细信息请参阅 [GitHub Issue #17](https://github.com/nicepkg/aide/issues/17)。

## 超出 AI 模型上下文限制

**问题描述**：AI 模型对上下文的字符数有限制，超出可能导致处理失败。

**解决方案**：

1. **部分文本处理**：

   - 多数功能允许用户选中部分文本后右键调用 AI 功能，以减少字符数。

2. **分批处理**：

   - 将文本分割成小段分别处理。

3. **切换模型**：
   - 选用支持更大上下文的 AI 模型。

## 配置了第三方 ==API Base URL== 无法使用

**问题描述**：配置了第三方 [`API Base URL`](../configuration/openai-base-url.md) 后，AI 功能无法正常使用。

**解决方案**：

1. **检查 `API Base URL`**：

   - 确认配置的 `API Base URL` 是否正确。
   - 默认 `API Base URL` 为 `https://api.openai.com/v1`。
   - 尝试在 URL 中添加或去掉 `/v1`，以确保正确配置。

2. **确认 API 符合 ==OpenAI== 接口规范**：

   - 询问供应商是否其 API 符合 ==OpenAI== 的接口规范。

3. **检查 `API Base URL` 和 AI 模型是否支持 `function_call` 功能**：
   - 某些功能使用了 `function_call` 功能，部分第三方大语言模型可能不支持该功能。

## Command 'aide.xxxx' Not Found

**问题描述**：在使用 ==Aide== 功能时，提示 `Command 'aide.xxxx' not found`。

**解决方案**：

1. **检查你的 VSCode 版本是否大于 v1.82.0**：

   - ==Aide== 需要 ==VSCode== 版本大于 `v1.82.0`。

2. **检查 ==Aide== 是否已正确安装最新版**：

   - 打开 ==VSCode== 的扩展侧边栏，搜索 ==Aide==，确保已安装最新版。

3. **如果以上方法无效**：

   - 请尝试重启 ==VSCode==。
   - 如果问题仍然存在，请尝试重新安装 ==Aide==。

## ==智能代码转换==无法弹出语言选择框，代码转换总是使用上次的设置

**问题描述**：第一次使用[智能代码转换](../features/code-convert.md)功能时，选择将 `C` 语言转换为 `C++` 语言。再次点击转换 `C` 语言文件时仍默认转换为 `C++`。我想尝试新的转换设置，但无法弹出语言选择框。

**解决方案**：

1. **关闭记忆功能**：在当前项目下 `.vscode/settings.json` 中设置 [`aide.autoRememberConvertLanguagePairs`](../configuration/auto-remember-convert-language-pairs.md) 为 `false`。
2. **清除已有的转换映射记忆**：在当前项目下 `.vscode/settings.json` 中删除 [`aide.convertLanguagePairs`](../configuration/convert-language-pairs.md) 配置。
3. **确保你的设置是正确的**：==VSCode== 有全局和项目级两个 `settings.json` 配置文件，默认记忆保存在项目级配置中。仔细检查项目文件夹中的 `.vscode/settings.json` 文件。

详细信息请参阅 [GitHub Issue #92](https://github.com/nicepkg/aide/issues/92)。

## ==智能粘贴==图片时提示剪贴板为空

**问题描述**：在使用[智能粘贴](../features/smart-paste.md)功能时，提示 `剪贴板为空`。

**解决方案**：

1. [**打开 VSCode 设置界面**](./customize-configuration.md)
2. **开启剪贴板读图设置**: 在设置界面中搜索开启 [`aide.readClipboardImage`](../configuration/read-clipboard-image.md)。
3. **报了其他错误**: 如果开启之后再次使用报其他错误，那就是你用的 AI 模型不支持读取图片，关闭即可。

## ==No tools_call in message== 错误

**问题描述**：在使用 ==Aide== 某些功能时，提示 `No tools_call in message` 错误。

**解决方案**：

1. **检查 AI 模型是否支持 `function_call` 功能**：

   - 询问 AI 模型提供商是否支持 `function_call` 功能。
   - 选择支持 `function_call` 功能的 AI 模型。

2. **更换支持 `function_call` 功能的 AI 模型**：

   - 国际模型建议 [OpenAI](../use-another-llm/openai.md) 的 `gpt-4o` 模型。
   - 中国的模型建议 [deepseek](../use-another-llm/deepseek.md) 的 `deepseek-coder` 模型。

## ==考虑支持其他IDE==

**问题描述**: ==Aide== 是否会考虑支持其他IDE，例如 ==JetBrains== 和 ==Visual Studio==？

**解决方案**:

1. **对 ==Visual Studio== 的有限支持**: 由于资源有限，==Visual Studio== 可能永远不会被支持。

2. **支持 ==JetBrains== 的可能性**: 社区对支持 ==JetBrains== 有强烈需求，但这需要熟悉 Kotlin 的人，因为 ==JetBrains== 插件是用 Kotlin 开发的。目前我缺乏实现此功能的必要技能。我可能会考虑在 ==Aide== 的主要功能完成后学习 Kotlin，并使用 AI 协助迁移到 ==JetBrains==。

3. **欢迎社区贡献**: 如果你有能力开发 ==JetBrains== 版本，欢迎贡献。如果有兴趣，请通过[GitHub](https://github.com/nicepkg/aide/issues/91)联系我们。
