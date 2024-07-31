# aide.aiPrompt

This configuration allows you to customize ==the template for AI prompts when batch copying files==. The template can include some placeholders:

**Template Parameters:**

| Parameter    | Description                       | Output Example                                                                                                        |
| ------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `#{content}` | Placeholder for full file content | <pre><code>File: example.js<br/>\`\`\`js<br/>const bar = "hello, aide";<br/>console.log(bar);<br/>\`\`\`</code></pre> |

**Usage Example:**

- **Default Template:**

  ```plaintext
  #{content}
  ```

- **Example:**
  ```plaintext
  Here is the code snippet:
  #{content}
  Please answer the following question:
  ```
