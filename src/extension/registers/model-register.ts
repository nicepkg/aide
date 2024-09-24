import {
  EmbeddingManager,
  embeddingModels
} from '@extension/ai/embeddings/embedding-manager'
import type { CommandManager } from '@extension/commands/command-manager'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'
import type { RegisterManager } from './register-manager'

export class ModelRegister extends BaseRegister {
  private embeddingManager: EmbeddingManager

  constructor(
    protected context: vscode.ExtensionContext,
    protected registerManager: RegisterManager,
    protected commandManager: CommandManager
  ) {
    super(context, registerManager, commandManager)
    this.embeddingManager = EmbeddingManager.getInstance()
  }

  async register(): Promise<void> {
    // Set the default active model
    await this.embeddingManager.setActiveModel(embeddingModels[0])
  }

  cleanup(): void {
    this.embeddingManager.dispose()
  }
}
