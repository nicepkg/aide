# aide.apiConcurrency

This configuration allows you to customize the ==AI request concurrency==, which is `1` by default. It is recommended not to change it when using local models.

- **Default Value:**

  ```json
  {
    "aide.apiConcurrency": 1
  }
  ```

::: tip
You can increase this number to speed up the [`AI Batch Processing`](../features/batch-processor.md). It is not recommended to exceed `3`.
:::
