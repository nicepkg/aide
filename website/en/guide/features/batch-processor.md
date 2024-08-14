# AI Batch Processor

Command Name: `aide.batchProcessor`

Use AI to process the code of multiple selected files according to your needs.

::: warning

This feature requires the AI model to support the `function_call` capability.

:::

**Scenarios:**

- **What it can do:**

  - When your manager requests a project code migration, AI can handle it in bulk, giving you time to grab a coffee.
  - Add detailed comments in bulk.
  - Optimize code in bulk.
  - Convert `C/C++` code to `Rust` code in bulk.
  - Convert `Vue2` code to `Vue3` code in bulk.
  - Convert `Vue` code to `React` code in bulk.
  - Convert `React` code to `Flutter` code in bulk.
  - Convert `React class components` to `React function components` in bulk.
  - Convert `JSON` to `YAML` in bulk.
  - More features await your imagination...

- **What it can‘t do:**

  - Handle specific business logic requirements.
  - Split a file into multiple files.

- **==Rest assured! Processing will not modify the original files==:**

  - It will generate a `file copy`, such as `app/index.py` -> `app/index.py.aide.py`.
  - You can click on the `file copy` and review it before deciding whether to replace the `original file`.
  - When opening the `file copy`, the `original file` will also open simultaneously for easy comparison.
  - You can click the `Replace Original` button in the `file copy` to replace the `original file`.

**Usage:**

- Select files or folders in the file explorer. (Multi-select: hold `Ctrl` or `Cmd` and click on files or folders)
- Right-click and select `✨ Aide: AI Batch Processor`.
- Enter your code processing requirements.

<Video src="/videos/aide-batch-processor.mp4"/>

::: tip

1. For long file codes, there may be issues with output interruption. Currently, there is no good solution.
2. Carefully review the processed files to ensure they are correct before replacing the source files. Never assume that AI-processed code is error-free.

:::

**Related Configuration:**

- You can customize the AI request concurrency by modifying the [`aide.apiConcurrency`](../configuration/api-concurrency.md) configuration.
