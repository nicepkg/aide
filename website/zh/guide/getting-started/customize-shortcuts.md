# 自定义快捷键

你可以自定义此扩展的命令的键盘快捷键以简化你的工作流程。按照以下步骤设置你喜欢的快捷键：

1. 打开键盘快捷键编辑器：

   - 按 `Ctrl+K Ctrl+S`（Windows/Linux）或 `Cmd+K Cmd+S`（Mac）
   - 或者转到 `Code > 首选项 > 键盘快捷方式`

2. 在键盘快捷键编辑器中，搜索你想要自定义的命令：

   - `Aide: 复制为 AI 提示词`
   - `Aide: 问 AI`
   - `Aide: 代码转换`
   - `Aide: 代码查看器助手`
   - `Aide: 重命名变量`
   - `Aide: 智能粘贴`
   - ...也许更多

3. 点击你想要分配快捷键的命令旁边的加号图标。

4. 按下你新快捷键的所需组合。

5. 如果与现有快捷键冲突，==VSCode== 会通知你。你可以选择覆盖现有快捷键或尝试其他组合。

以下是你可以自定义的默认命令：

- `aide.copyAsPrompt`: 复制为 AI 提示词
- `aide.askAI`: 问 AI
- `aide.codeConvert`: 代码转换
- `aide.codeViewerHelper`: 代码查看器助手
- `aide.renameVariable`: 重命名变量
- `aide.smartPaste`: 智能粘贴
- ...也许更多，你可以在每个功能文档里找到对应的命令。

<br/>
<Video src="/videos/aide-customize-shortcuts.mp4"/>
<br/>

**示例：**

为 `Ask AI` 命令设置 `Ctrl+Shift+A`（Windows/Linux）或 `Cmd+Shift+A`（Mac）：

1. 在键盘快捷键编辑器中搜索 `Aide: Ask AI`
2. 点击 `aide.askAI` 命令旁边的加号图标
3. 按下 `Ctrl+Shift+A` 或 `Cmd+Shift+A`
4. 新快捷键会自动保存

对你希望自定义的任何其他命令重复此过程。

注意：如果你更喜欢直接编辑 `keybindings.json` 文件，可以添加如下条目：

```json
{
  "key": "ctrl+shift+a",
  "command": "aide.askAI",
  "when": "editorTextFocus"
}
```

将 `"ctrl+shift+a"` 替换为你想要的键组合，将 `"aide.askAI"` 替换为你想要分配的命令。

通过自定义这些快捷键，你可以快速访问扩展的功能，提高你在 ==VSCode== 中的生产力。
