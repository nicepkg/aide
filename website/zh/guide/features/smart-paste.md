# 智能粘贴

命令名称：`aide.smartPaste`

使用 AI 智能识别剪贴板里的==代码或者图片==并进行格式转换，然后粘贴到当前编辑器中。此功能可以显著提高开发效率，特别是在处理跨语言或跨框架的代码转换时。

**使用方法：**

- 从其他地方复制代码到剪贴板。
- 鼠标放在编辑器中想要粘贴的位置。（这个位置会影响粘贴结果）
- 右键菜单选择 `✨ Aide: 智能粘贴`。

::: warning 警告
该功能需要 AI 模型支持 `function_call` 功能

读图功能需要打开 [`aide.readClipboardImage`](../configuration/read-clipboard-image.md) 配置，并且 AI 模型要支持读图功能，推荐用 `gpt-4o` 模型。
:::

<Video src="/videos/aide-smart-paste.mp4"/>

::: tip 提示

==Aide== 会智能洞察你的内心，自动识别并进行转换，无需额外配置。例如：

- 如果你复制了一个设计稿截图，然后智能粘贴到 `vue/react/flutter` 代码中，==Aide== 会自动将其转换成对应的 `UI` 代码。(此功能需要打开 [`aide.readClipboardImage`](../configuration/read-clipboard-image.md) 配置)

- 如果你复制了一个数据库设计图，然后智能粘贴到 `SQL` 文件中，==Aide== 会自动将其转换成对应的 `SQL` 代码。

- 如果你复制了一个 `JSON` 粘贴到 `TypeScript` 文件里，==Aide== 会自动将其转换成 `TypeScript` 类型定义。

- 如果你复制了 `Tailwind CSS` 代码粘贴到 `Flutter Dart` 文件里，它会自动转换成 `Flutter Widget`。

- 你也可以复制一个 `Python` 函数粘贴到 `Rust` 文件里，==Aide== 会自动将其转换成 `Rust` 函数。

当然，它功能远不止于此，你可以自行探索更多的用途。

:::

**使用示例：**

- **从 `JSON` 到 `TypeScript` 类型**

假设你有以下的 `JSON` 数据：

```json
{
  "name": "John",
  "age": 30,
  "isAdmin": true
}
```

将其复制到剪贴板，然后在 `TypeScript` 文件中使用 `智能粘贴` 功能，==Aide== 会自动将其转换为 `TypeScript` 类型定义：

```typescript
type User = {
  name: string
  age: number
  isAdmin: boolean
}
```

- **从 `Tailwind CSS` 到 `Flutter Widget`**

假设你有以下的 `Tailwind CSS` 代码：

```html
<div class="bg-blue-500 text-white p-4">Hello, World!</div>
```

将其复制到剪贴板，然后在 `Flutter Dart` 文件中使用 `智能粘贴` 功能，==Aide== 会自动将其转换为 `Flutter Widget`：

```dart
Container(
  color: Colors.blue,
  padding: EdgeInsets.all(16),
  child: Text(
    'Hello, World!',
    style: TextStyle(color: Colors.white),
  ),
)
```

**相关配置：**

- 你可以通过配置 [`aide.readClipboardImage`](../configuration/read-clipboard-image.md) 来自定义某些场景是否可以读取剪贴板图像作为 AI 上下文。
