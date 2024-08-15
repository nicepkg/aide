# aide.expertCodeEnhancerPromptList

此配置允许你自定义==让大师帮你改代码 AI 提示词列表==。通过这些提示词，你可以指定如何优化和重构代码。

提示词可以基于文件路径匹配，实现对特定文件的定制化优化。

**提示词配置字段：**

| 字段          | 描述                                                                                                                                 | 是否必填 | 默认值   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------- |
| `match`       | 文件路径匹配模式，支持 [glob](https://github.com/isaacs/node-glob) 语法。只有匹配中当前文件路径，才会显示这个提示词。                | 否       | `"**/*"` |
| `title`       | 提示词的标题，显示在选择列表中。                                                                                                     | 是       |          |
| `prompt`      | 提示词内容，描述需要 AI 进行的优化操作。                                                                                             | 是       |          |
| `sort`        | 排序权重，数字越小排得越靠前。                                                                                                       | 否       | `1000`   |
| `autoContext` | 是否启用自动上下文支持，开启意味着 AI 会同时阅读可能与当前文件有关的文件再处理代码，默认为 `false`。 需要模型 `function_call` 功能。 | 否       | `false`  |

**使用示例：**

```json
{
  "aide.expertCodeEnhancerPromptList": [
    {
      "match": ["**/*.sql", "**/*Repository.{java,kt,scala,cs,py,js,ts}"],
      "title": "优化数据库查询",
      "prompt": "Analyze and optimize the database queries in the following code. Focus on improving query performance, reducing unnecessary joins, optimizing indexing suggestions, and ensuring efficient data retrieval patterns.",
      "autoContext": true
    },
    {
      "match": ["**/*.vue", "**/*.tsx", "**/*.jsx"],
      "title": "拆分为更小的组件",
      "prompt": "Analyze the following code and split it into smaller, more manageable components. Focus on identifying reusable parts, separating concerns, and improving overall component structure. Provide the refactored code.",
      "autoContext": true
    },
    {
      "match": "**/*",
      "title": "使用 DRY 原则优化",
      "prompt": "Refactor the following code to eliminate redundancy and improve maintainability by applying the DRY (Don't Repeat Yourself) principle. Identify repeated code patterns and abstract them into reusable functions or classes as appropriate.",
      "autoContext": false
    }
  ]
}
```
