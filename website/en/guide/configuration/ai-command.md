# aide.aiCommand

This configuration allows you to customize ==the template used== for the `✨ Aide: Ask AI` command execution. The template can include some placeholders:

**Template Parameters:**

| Parameter              | Description                  | Output Example                                                                                                        |
| ---------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `#{filesRelativePath}` | Placeholder for file paths   | `"./src/index.ts" "./src/utils.ts"`                                                                                   |
| `#{filesFullPath}`     | Placeholder for full paths   | `"/project/src/index.ts" "/project/src/utils.ts"`                                                                     |
| `#{question}`          | Placeholder for user query   | `"What is the purpose of this code?" `                                                                                |
| `#{content}`           | Placeholder for file content | <pre><code>File: example.js<br/>\`\`\`js<br/>const bar = "hello, aide";<br/>console.log(bar);<br/>\`\`\`</code></pre> |

**Usage Example:**

- **Default Template:**

  By default, the template is blank, and you'll need to provide a custom template.

- **Example:**

  It is recommended to use the [`aider (a highly regarded command-line AI tool)`](https://github.com/paul-gauthier/aider) command to ask AI questions about the selected files.

  - If you want to open a new terminal window each time to ask a question to [`aider`](https://github.com/paul-gauthier/aider), you can use the following template:

    ```plaintext
    aider #{filesRelativePath}
    ```

  - If you prefer to manually start [`aider`](https://github.com/paul-gauthier/aider) and then add files manually, you can set [`aide.aiCommandCopyBeforeRun`](./ai-command-copy-before-run.md) to `true` and [`aide.aiCommandAutoRun`](./ai-command-auto-run.md) to `false`. Then, use the following template:

    ```plaintext
    /add #{filesRelativePath}
    ```

    This way, you can copy commands like `/add ./src/aaa.ts ./src/bbb.ts` and paste them into the [`aider`](https://github.com/paul-gauthier/aider) terminal window each time.
