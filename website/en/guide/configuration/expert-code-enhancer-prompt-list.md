# aide.expertCodeEnhancerPromptList

This configuration allows you to customize ==the AI prompt list for expert code enhancement==.

With these prompts, you can specify how to optimize and refactor your code. Prompts can be customized to match specific files based on file path patterns.

**Prompt Configuration Fields:**

| Field         | Description                                                                                                                                                                                                       | Required | Default  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- |
| `match`       | File path matching pattern, supports [glob](https://github.com/isaacs/node-glob) syntax. The prompt will only be displayed if the current file path matches.                                                      | No       | `"**/*"` |
| `title`       | Title of the prompt, displayed in the selection list.                                                                                                                                                             | Yes      |          |
| `prompt`      | Content of the prompt, describing the optimization operation needed.                                                                                                                                              | Yes      |          |
| `sort`        | Sorting weight, the smaller the number, the higher it ranks.                                                                                                                                                      | No       | `1000`   |
| `autoContext` | Whether to enable automatic context support. When enabled, AI will also read files potentially related to the current file before processing the code. Defaults to `false`. Requires the `function_call` feature. | No       | `false`  |

**Usage Example:**

```json
{
  "aide.expertCodeEnhancerPromptList": [
    {
      "match": ["**/*.sql", "**/*Repository.{java,kt,scala,cs,py,js,ts}"],
      "title": "Optimize Database Queries",
      "prompt": "Analyze and optimize the database queries in the following code. Focus on improving query performance, reducing unnecessary joins, optimizing indexing suggestions, and ensuring efficient data retrieval patterns.",
      "autoContext": true
    },
    {
      "match": ["**/*.vue", "**/*.tsx", "**/*.jsx"],
      "title": "Split Into Smaller Components",
      "prompt": "Analyze the following code and split it into smaller, more manageable components. Focus on identifying reusable parts, separating concerns, and improving overall component structure. Provide the refactored code.",
      "autoContext": true
    },
    {
      "match": "**/*",
      "title": "Optimize Using DRY Principles",
      "prompt": "Refactor the following code to eliminate redundancy and improve maintainability by applying the DRY (Don't Repeat Yourself) principle. Identify repeated code patterns and abstract them into reusable functions or classes as appropriate.",
      "autoContext": false
    }
  ]
}
```
