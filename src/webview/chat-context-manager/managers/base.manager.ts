export abstract class BaseContextManager<T extends object> {
  protected context: T

  constructor(initialContext: T) {
    this.context = initialContext
  }

  getContext(): T {
    return JSON.parse(JSON.stringify(this.context))
  }

  updateContext(newContext: Partial<T>): void {
    this.context = { ...this.context, ...newContext }
  }
}
