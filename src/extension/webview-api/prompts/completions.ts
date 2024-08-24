// {
// 	"prompt": "// Path: src/extension/auto-task/utils.ts\nimport { MAX_RETRIES } from './constants'\n\nexport async function retryOperation<T>(\n  operation: () => Promise<T>,\n  maxRetries: number = MAX_RETRIES\n): Promise<T> {\n  for (let i = 0; i < maxRetries; i++) {\n    try {\n      return await operation()\n    } catch (error) {\n      if (i === maxRetries - 1) throw error\n      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** i))\n    }\n  }\n  throw new Error('Max retries reached')\n}\n\nexport const retry = <T>(operation: () => Promise<T>) => retryOperation(operation)\n",
// 	"suffix": "",
// 	"max_tokens": 500,
// 	"temperature": 0.2,
// 	"top_p": 1,
// 	"n": 3,
// 	"stop": ["\n\n\n", "\n```"],
// 	"nwo": "nicepkg/aide",
// 	"stream": true,
// 	"extra": {
// 		"language": "typescript",
// 		"next_indent": 0,
// 		"trim_by_indentation": true,
// 		"prompt_tokens": 151,
// 		"suffix_tokens": 0
// 	}
// }
