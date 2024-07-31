# aide.apiConcurrency

此配置允许您自定义 ==AI 请求并发数==，默认是 `1`，用本地模型的最好不要改。

- **默认值:**

  ```json
  {
    "aide.apiConcurrency": 1
  }
  ```

::: tip 提示
你可以通过改大这个数目来提升 [`AI 批量处理文件`](../features/batch-processor.md) 的速度。不建议超过 `3`。
:::
