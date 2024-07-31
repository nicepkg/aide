# aide.codeViewerHelperPrompt

此配置允许你自定义==代码查看助手 AI 提示词模板==。模板可以包括一些占位符：

**模板参数：**

| 参数                | 描述                  | 输出示例                                                                                   |
| ------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| `#{sourceLanguage}` | 源代码语言占位符      | `javascript`                                                                               |
| `#{locale}`         | 用户的语言/区域占位符 | `en`                                                                                       |
| `#{content}`        | 文件的完整内容占位符  | <pre lang="javascript"><code>const bar = "hello, aide";<br/>console.log(bar);</code></pre> |

**使用示例：**

- **默认模板：**

  ```plaintext
  You are a programming language commentator.
  You need to help me add comments to #{sourceLanguage} code as much as possible to make it readable for beginners.
  Do not change the original code, just add as detailed comments as possible, because my purpose is only to understand and read.
  Please use my native language #{locale} as the commenting language.
  Please do not reply with any text other than the code, and do not use markdown syntax.
  Here is the code you need to comment on:
  #{content}
  ```

- **示例：**

  ```plaintext
  Provide detailed comments for the following #{sourceLanguage} code, using #{locale}:
  #{content}
  ```
