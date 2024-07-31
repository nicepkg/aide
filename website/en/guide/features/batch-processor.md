# AI Batch Processor

Command Name: `aide.batchProcessor`

Use AI to process the code of multiple selected files according to your needs.

**What it can do:**

- Batch add detailed comments
- Batch optimize code
- Batch convert `vue2` code to `vue3` code
- Batch convert `vue` code to `react` code
- Batch convert `react` code to `flutter` code
- Batch convert `react class component` code to `react function component` code
- Batch convert `rust` code to `js` code
- Batch convert `json` code to `yaml` code
- Use your imagination...

**What it cannot do:**

- Specific business requirements
- Split one file into multiple files

**==Rest assured! Processing will not modify the source file==:**

- It will generate an additional `file copy`. For example, `app/index.py` -> `app/index.py.aide.py`.
- You can click the `file copy`, review it, and then decide whether to replace the `source file`.
- When opening the `file copy`, the `source file` will be opened simultaneously, allowing you to compare at any time.
- You can click the `Replace Original` button on the first line of the `file copy` to replace the `source file`.

**Usage:**

- Select files or folders in the file explorer. (Multi-select: hold `Ctrl` or `Cmd` and click on files or folders)
- Right-click and select `✨ Aide: AI Batch Processor`.
- Enter your code processing requirements.

::: warning

This feature requires the AI model to support the `function_call` feature.

:::

<Video src="/videos/aide-batch-processor.mp4"/>

::: tip

1. For long file codes, there may be issues with output interruption. Currently, there is no good solution.
2. Carefully review the processed files to ensure they are correct before replacing the source files. Never assume that AI-processed code is error-free.

:::

**Related Configuration:**

- You can customize the AI request concurrency by modifying the [`aide.apiConcurrency`](../configuration/api-concurrency.md) configuration.
