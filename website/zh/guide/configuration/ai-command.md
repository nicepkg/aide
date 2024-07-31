# aide.aiCommand

此配置允许你自定义 `✨ Aide: 问 AI` ==命令执行的模板==。模板可以包括一些占位符：

**模板参数：**

| 参数                   | 描述                 | 输出示例                                                                                                              |
| ---------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `#{filesRelativePath}` | 文件相对路径占位符   | `"./src/index.ts" "./src/utils.ts"`                                                                                   |
| `#{filesFullPath}`     | 文件完整路径占位符   | `"/project/src/index.ts" "/project/src/utils.ts"`                                                                     |
| `#{question}`          | 用户输入问题的占位符 | `"What is the purpose of this code?" `                                                                                |
| `#{content}`           | 文件的完整内容占位符 | <pre><code>File: example.js<br/>\`\`\`js<br/>const bar = "hello, aide";<br/>console.log(bar);<br/>\`\`\`</code></pre> |

**使用示例：**

- **默认模板：**

  默认情况下，模板为空白，你需要提供一个自定义模板。

- **示例：**

  推荐使用 [`aider (一个广受好评的命令行 AI 工具)`](https://github.com/paul-gauthier/aider) 命令来询问 AI 关于所选文件的问题。

  - 如果你想每次都打开一个新的终端窗口向 [`aider`](https://github.com/paul-gauthier/aider) 提问，你可以使用以下模板：

    ```plaintext
    aider #{filesRelativePath}
    ```

  - 如果你想自己手动启动 [`aider`](https://github.com/paul-gauthier/aider)，然后手动添加文件，可以设置 [`aide.aiCommandCopyBeforeRun`](./ai-command-copy-before-run.md) 为 `true`，[`aide.aiCommandAutoRun`](./ai-command-auto-run.md) 为 `false`，然后使用以下模板：

    ```plaintext
    /add #{filesRelativePath}
    ```

    这样你每次就能复制类似 `/add ./src/aaa.ts ./src/bbb.ts` 的命令，然后粘贴到 [`aider`](https://github.com/paul-gauthier/aider) 终端窗口中。
