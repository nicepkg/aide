'use strict'
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, '__esModule', { value: true })
exports.binding = void 0
// export native binding
exports.binding =
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  require(
    `./onnxruntime/bin/napi-v3/${process.platform}/${process.arch}/onnxruntime_binding.node`
  )
//# sourceMappingURL=binding.js.map
