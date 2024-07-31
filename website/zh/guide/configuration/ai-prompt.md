# aide.aiPrompt

此配置允许你自定义==批量复制文件时 AI 提示词的模板==。模板可以包括一些占位符：

**模板参数：**

| 参数         | 描述                 | 输出示例                                                                                                              |
| ------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `#{content}` | 文件的完整内容占位符 | <pre><code>File: example.js<br/>\`\`\`js<br/>const bar = "hello, aide";<br/>console.log(bar);<br/>\`\`\`</code></pre> |

**使用示例：**

- **默认模板：**

  ```plaintext
  #{content}
  ```

- **示例：**
  ```plaintext
  Here is the code snippet:
  #{content}
  Please answer the following question:
  ```
