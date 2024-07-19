# Smart Paste

Command Name: `aide.smartPaste`

Utilizes AI to intelligently recognize code in the clipboard, format it, and then paste it into the current editor. This feature can significantly enhance development efficiency, especially when dealing with code conversions across different languages or frameworks.

**Usage:**

- Copy code from somewhere else to the clipboard.
- Place the cursor at the desired location in the editor. (This position will affect the paste result)
- Right-click and select `✨ Aide: Smart Paste`.

::: warning
This feature requires AI model support for `function_call` capability.
:::

::: tip

`Aide` will intelligently interpret your intention, automatically recognizing and converting the content without additional configuration. For example:

- If you copy a `JSON` and paste it into a `TypeScript` file, `Aide` will automatically convert it into a `TypeScript` type definition.

- If you copy some `Tailwind CSS` code and paste it into a `Flutter Dart` file, it will automatically convert it into a `Flutter Widget`.

- You can also copy a `Python` function and paste it into a `Rust` file, and `Aide` will automatically convert it into a `Rust` function.

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

Copy it to the clipboard, then use the `Smart Paste` feature in a `TypeScript` file, and `Aide` will automatically convert it into a `TypeScript` type definition:

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

Copy it to the clipboard, then use the `Smart Paste` feature in a `Flutter Dart` file, and `Aide` will automatically convert it into a `Flutter Widget`:

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
