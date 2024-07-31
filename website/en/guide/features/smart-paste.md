# Smart Paste

Command Name: `aide.smartPaste`

Use AI to intelligently recognize ==code or images== from the clipboard and perform format conversion, then paste it into the current editor. This feature can significantly enhance development efficiency, especially when dealing with cross-language or cross-framework code conversions.

**Usage:**

- Copy code from somewhere else to the clipboard.
- Place the cursor at the desired location in the editor. (This position will affect the paste result)
- Right-click and select `✨ Aide: Smart Paste`.

::: warning
This feature requires AI model support for `function_call` capability.

The image reading feature requires enabling the [`aide.readClipboardImage`](../configuration/read-clipboard-image.md) configuration. The AI model must also support image reading. We recommend using the `gpt-4o` model.
:::

<Video src="/videos/aide-smart-paste.mp4"/>

::: tip

==Aide== will intelligently interpret your intention, automatically recognizing and converting the content without additional configuration. For example:

- If you copy a design screenshot and paste it into `vue/react/flutter` code, ==Aide== will automatically convert it into the corresponding `UI` code. (This feature requires enabling the [`aide.readClipboardImage`](../configuration/read-clipboard-image.md) configuration)

- If you copy a database design diagram and paste it into an `SQL` file, ==Aide== will automatically convert it into the corresponding `SQL` code.

- If you copy a `JSON` and paste it into a `TypeScript` file, ==Aide== will automatically convert it into a `TypeScript` type definition.

- If you copy some `Tailwind CSS` code and paste it into a `Flutter Dart` file, it will automatically convert it into a `Flutter Widget`.

- You can also copy a `Python` function and paste it into a `Rust` file, and ==Aide== will automatically convert it into a `Rust` function.

Of course, its functionalities are not limited to these examples. Feel free to explore more use cases.

:::

**Examples:**

- **From `JSON` to `TypeScript` Type**

Suppose you have the following `JSON` data:

```json
{
  "name": "John",
  "age": 30,
  "isAdmin": true
}
```

Copy it to the clipboard, then use the `Smart Paste` feature in a `TypeScript` file, and ==Aide== will automatically convert it into a `TypeScript` type definition:

```typescript
type User = {
  name: string
  age: number
  isAdmin: boolean
}
```

- **From `Tailwind CSS` to `Flutter Widget`**

Suppose you have the following `Tailwind CSS` code:

```html
<div class="bg-blue-500 text-white p-4">Hello, World!</div>
```

Copy it to the clipboard, then use the `Smart Paste` feature in a `Flutter Dart` file, and ==Aide== will automatically convert it into a `Flutter Widget`:

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

**Related Configuration:**

- You can customize whether certain scenarios can read clipboard images as AI context by configuring [`aide.readClipboardImage`](../configuration/read-clipboard-image.md).
