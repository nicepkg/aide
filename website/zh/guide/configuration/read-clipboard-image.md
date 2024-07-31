# aide.readClipboardImage

此配置允许您自定义==是否允许某些场景读取剪贴板图片==作为 AI 上下文。

- **默认值:**

  ```json
  {
    "aide.readClipboardImage": false
  }
  ```

::: warning 警告
需要 AI 模型支持图片读取，否则开了可能会出错。

对于 `linux` 用户，需要安装 `xclip` 以支持剪贴板图片读取。比如执行:

`sudo apt-get install xclip`。
:::

目前支持以下场景：

- [`智能粘贴`](../features/smart-paste.md)
