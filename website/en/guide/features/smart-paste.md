# Smart Paste

Command Name: `aide.smartPaste`

Use AI to intelligently recognize ==code or images== from the clipboard and perform format conversion, then paste it into the current editor.

This feature can significantly enhance development efficiency, especially when dealing with cross-language or cross-framework code conversions.

::: warning
This feature requires AI model support for `function_call` capability.

The image reading feature requires enabling the [`aide.readClipboardImage`](../configuration/read-clipboard-image.md) configuration. The AI model must also support image reading. We recommend using the `gpt-4o` model.
:::

**Scenarios:**

- As a `CV` engineer not satisfied with the status quo, you desire a smarter paste function.
- ==Smart Paste== will intelligently recognize clipboard content and automatically convert it.
- Copying `JSON` and pasting into a `TypeScript` file will automatically generate type definitions.
- Copying `HTML` and pasting into a `Flutter` file will automatically convert it into a `Flutter Widget`.
- Copying a `Python` function and pasting into a `Rust` file will automatically generate the corresponding `Rust` function.
- Copying a design draft screenshot and pasting into `Vue/React/Flutter` code will automatically generate the corresponding `UI` code.
- Copying a database design diagram and pasting into an `SQL` file will automatically generate the relevant `SQL` code.
- More features await your imagination...

**Usage:**

- Copy code from somewhere else to the clipboard.
- Place the cursor at the desired location in the editor. (This position will affect the paste result)
- Right-click and select `✨ Aide: Smart Paste`.

<Video src="/videos/aide-smart-paste.mp4"/>

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

- **From `TailwindCSS HTML` to `Flutter Widget`**

Suppose you have the following `TailwindCSS HTML` code:

```html
<div class="bg-blue-500 text-white p-4">Hello, World!</div>
```

Copy it to the clipboard, then use the `Smart Paste` feature in a `Flutter` file, and ==Aide== will automatically convert it into a `Flutter Widget`:

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
