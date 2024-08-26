import type { Attachments as IAttachments } from '../types/chat-context/conversation'
import type { ContextProcessor } from '../types/context-processor'

export class ProcessorRegistry<
  AttachmentName extends keyof IAttachments = keyof IAttachments
> {
  private processors: Map<
    AttachmentName,
    ContextProcessor<IAttachments[AttachmentName]>
  > = new Map()

  register(
    name: AttachmentName,
    processor: ContextProcessor<IAttachments[AttachmentName]>
  ): void {
    this.processors.set(name, processor)
  }

  get(
    name: AttachmentName
  ): ContextProcessor<IAttachments[AttachmentName]> | undefined {
    return this.processors.get(name)
  }

  entries(): IterableIterator<[AttachmentName, ContextProcessor<any>]> {
    return this.processors.entries()
  }
}
