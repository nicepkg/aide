import { AskAICommand } from './ask-ai/command'
import type { BaseCommand } from './base.command'
import { CodeConvertCommand } from './code-convert/command'
import { CodeViewerHelperCommand } from './code-viewer-helper/command'
import { CommandManager } from './command-manager'
import { CopyAsPromptCommand } from './copy-as-prompt/command'
import { ExpertCodeEnhancerCommand } from './expert-code-enhancer/command'
import { CopyFileTextCommand } from './private/copy-file-text.command'
import { OpenWebviewCommand } from './private/open-webview.command'
import { QuickCloseFileWithoutSaveCommand } from './private/quick-close-file-without-save.command'
import { ReplaceFileCommand } from './private/replace-file.command'
import { ShowAideKeyUsageInfoCommand } from './private/show-aide-key-usage-info.command'
import { ShowDiffCommand } from './private/show-diff.command'
import { RenameVariableCommand } from './rename-variable/command'
import { SmartPasteCommand } from './smart-paste/command'

export const registerCommands = (commandManager: CommandManager) => {
  const Commands = [
    CopyAsPromptCommand,
    AskAICommand,
    CodeConvertCommand,
    CodeViewerHelperCommand,
    ExpertCodeEnhancerCommand,
    RenameVariableCommand,
    SmartPasteCommand,

    // private command
    CopyFileTextCommand,
    QuickCloseFileWithoutSaveCommand,
    ReplaceFileCommand,
    ShowDiffCommand,
    ShowAideKeyUsageInfoCommand,
    OpenWebviewCommand
  ] satisfies (typeof BaseCommand)[]

  Commands.forEach(Command => commandManager.registerCommand(Command))
}
