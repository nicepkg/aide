import { logger } from '@extension/logger'
import * as vscode from 'vscode'

import type { DiffProcessor } from './diff-processor'
import { InlineDiffTask, type DiffBlockWithRange } from './types'

export class DecorationManager {
  private diffDecorationTypes: {
    add: vscode.TextEditorDecorationType
    remove: vscode.TextEditorDecorationType
    scanning: vscode.TextEditorDecorationType
  }

  constructor(private diffProcessor: DiffProcessor) {
    this.diffDecorationTypes = {
      add: vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor(
          'diffEditor.insertedTextBackground'
        ),
        isWholeLine: true
      }),
      remove: vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor(
          'diffEditor.removedTextBackground'
        ),
        isWholeLine: true
      }),
      scanning: vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor(
          'editor.findMatchHighlightBackground'
        ),
        isWholeLine: true
      })
    }
  }

  async updateDecorations(
    editor: vscode.TextEditor,
    task: InlineDiffTask,
    blocksWithRange: DiffBlockWithRange[]
  ) {
    const addRanges: vscode.Range[] = []
    const removeRanges: vscode.Range[] = []

    await Promise.all(
      task.diffBlocks.map(async block => {
        if (!task.waitForReviewDiffBlockIds.includes(block.id)) {
          return
        }

        if (block.type === 'add') {
          const range = await this.diffProcessor.getDiffBlockDisplayRange(
            blocksWithRange,
            block
          )
          addRanges.push(range)
        } else if (block.type === 'remove') {
          const range = await this.diffProcessor.getDiffBlockDisplayRange(
            blocksWithRange,
            block
          )
          removeRanges.push(range)
        }
      })
    )

    editor.setDecorations(this.diffDecorationTypes.add, addRanges)
    editor.setDecorations(this.diffDecorationTypes.remove, removeRanges)
  }

  async updateScanningDecoration(
    editor: vscode.TextEditor,
    task: InlineDiffTask,
    isLast = false
  ) {
    try {
      if (isLast) {
        editor.setDecorations(this.diffDecorationTypes.scanning, [])
        return
      }

      const lines = task.replacementContent.split('\n')
      const lastLineIndex = task.selectionRange.start.line + lines.length - 1

      const scanningRange = new vscode.Range(
        lastLineIndex,
        0,
        lastLineIndex,
        lines[lines.length - 1]?.length || 0
      )

      editor.setDecorations(this.diffDecorationTypes.scanning, [scanningRange])
    } catch (error) {
      logger.error(
        'Error in inline diff stream task runScanningDecoration',
        error
      )
    }
  }

  dispose() {
    Object.values(this.diffDecorationTypes).forEach(d => d.dispose())
  }
}
