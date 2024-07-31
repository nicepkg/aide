# aide.readClipboardImage

This configuration allows you to customize ==whether certain scenarios can read clipboard images== as AI context.

- **Default Value:**

  ```json
  {
    "aide.readClipboardImage": false
  }
  ```

::: warning
The AI model needs to support image reading; otherwise, enabling this feature might cause errors.

For `linux` users, installing `xclip` is required to support reading clipboard images. For example, you can execute:

`sudo apt-get install xclip`.
:::

Currently supported scenarios include:

- [`Smart Paste`](../features/smart-paste.md)
