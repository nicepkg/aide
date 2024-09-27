import type { ControllerClass } from '@extension/webview-api/types'

export type InferControllerMethods<T> = T extends new (...args: any) => infer R
  ? {
      [K in keyof R as R[K] extends Function ? K : never]: R[K]
    }
  : never

export type InferMethodParams<T, M extends keyof T> = T[M] extends (
  req: infer P
) => any
  ? P
  : never
export type InferMethodReturn<T, M extends keyof T> = T[M] extends (
  req: any
) => Promise<infer R>
  ? R
  : T[M] extends (req: any) => AsyncGenerator<any, any, any>
    ? void
    : never

export type APIType<T extends readonly ControllerClass[]> = {
  [K in T[number] as InstanceType<K>['name']]: {
    [M in keyof InferControllerMethods<K>]: (
      req: InferMethodParams<InferControllerMethods<K>, M>,
      onStream?: (chunk: any) => void
    ) => Promise<InferMethodReturn<InferControllerMethods<K>, M>>
  }
}
