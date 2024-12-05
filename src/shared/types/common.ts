export type UnPromise<T> = T extends Promise<infer U> ? U : T
export type MaybePromise<T> = T | Promise<T>
export type ValueUnion<T> = T[keyof T]
