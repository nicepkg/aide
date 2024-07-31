# aide.codeViewerHelperPrompt

This configuration allows you to customize ==the AI prompt template for the code viewer assistant==. The template can include some placeholders:

**Template Parameters:**

| Parameter           | Description              | Output Example                                                                             |
| ------------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| `#{sourceLanguage}` | Source code language     | `javascript`                                                                               |
| `#{locale}`         | User's language/locale   | `en`                                                                                       |
| `#{content}`        | Full content of the file | <pre lang="javascript"><code>const bar = "hello, aide";<br/>console.log(bar);</code></pre> |

**Usage Examples:**

- **Default Template:**

  ```plaintext
  You are a programming language commentator.
  You need to help me add comments to #{sourceLanguage} code as much as possible to make it readable for beginners.
  Do not change the original code, just add as detailed comments as possible, because my purpose is only to understand and read.
  Please use my native language #{locale} as the commenting language.
  Please do not reply with any text other than the code, and do not use markdown syntax.
  Here is the code you need to comment on:
  #{content}
  ```

- **Example:**

  ```plaintext
  Provide detailed comments for the following #{sourceLanguage} code, using #{locale}:
  #{content}
  ```
