import type { CommandManager } from '@extension/commands/command-manager'
import { RegisterManager } from '@extension/registers/register-manager'
import { Annotation, type StateDefinition } from '@langchain/langgraph'

export const baseState = {
  registerManager: Annotation<RegisterManager>({
    reducer: (x, y) => y ?? x
  }),
  commandManager: Annotation<CommandManager>({
    reducer: (x, y) => y ?? x
  })
} satisfies StateDefinition
