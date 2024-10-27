import { logger } from '@extension/logger'
import { diffLines } from 'diff'
import { v4 as uuidv4 } from 'uuid'
import * as vscode from 'vscode'

import { DiffBlock, InlineDiffTask, type DiffBlockWithRange } from './types'

export class DiffProcessor {
  private disposes: vscode.Disposable[] = []

  async getEditor(task: InlineDiffTask) {
    const document = await vscode.workspace.openTextDocument(
      task.originalFileUri
    )
    return await vscode.window.showTextDocument(document)
  }

  async applyDiffToDocument(
    task: InlineDiffTask,
    renderDiffContent: string,
    renderDiffRange: vscode.Range
  ) {
    const editor = await this.getEditor(task)
    const currentContent = editor.document.getText(renderDiffRange)
    if (currentContent === renderDiffContent) {
      return
    }

    const currentEndLine = editor.document.lineCount - 1
    const currentEndLineTextLength =
      editor.document.lineAt(currentEndLine).text.length

    try {
      await editor.edit(editBuilder => {
        editBuilder.replace(renderDiffRange, renderDiffContent)

        if (renderDiffRange.end.line < currentEndLine) {
          const extraLinesRange = new vscode.Range(
            renderDiffRange.end.line + 1,
            0,
            currentEndLine,
            currentEndLineTextLength
          )
          editBuilder.delete(extraLinesRange)
        }
      })

      task.lastKnownDocumentVersion = editor.document.version
    } catch (error) {
      logger.error('Error applying diff to document', error)
      throw error
    }
  }

  async getDiffBlocksWithDisplayRange(
    task: InlineDiffTask
  ): Promise<DiffBlockWithRange[]> {
    const baseStartLine = task.selectionRange.start.line
    const blocksWithRange: DiffBlockWithRange[] = []
    let totalOffset = 0

    for (const block of task.diffBlocks) {
      const edit = task.history
        .getEditsUpToCurrent()
        .find(e => e.blockId === block.id)
      const status = edit ? edit.editType : 'pending'
      const startLine = baseStartLine + block.oldStart + totalOffset
      let renderedLines: string[] = []

      switch (block.type) {
        case 'remove': {
          renderedLines = status === 'accept' ? [] : block.oldLines
          status === 'accept' && (totalOffset -= block.oldLines.length)
          break
        }

        case 'add': {
          renderedLines = status === 'reject' ? [] : block.newLines
          status === 'reject' && (totalOffset -= block.newLines.length)
          break
        }

        case 'no-change': {
          renderedLines = block.oldLines
          break
        }

        default: {
          throw new Error('Unknown block type')
        }
      }

      const range = new vscode.Range(
        startLine,
        0,
        startLine + (renderedLines.length || 1) - 1,
        Number.MAX_SAFE_INTEGER
      )

      blocksWithRange.push({
        ...block,
        displayRange: range,
        status,
        renderedLines
      })
    }

    // Handle overlapping blocks
    for (let i = 1; i < blocksWithRange.length; i++) {
      const getPrevDisplayBlock = (
        index: number
      ): DiffBlockWithRange | undefined => {
        if (index < 0) return
        const block = blocksWithRange[index]!
        if (block.renderedLines.length === 0)
          return getPrevDisplayBlock(index - 1)
        return block
      }

      const prevDisplayBlock = getPrevDisplayBlock(i - 1)
      if (!prevDisplayBlock) continue

      const currBlock = blocksWithRange[i]!

      if (
        currBlock.displayRange.start.line <=
        prevDisplayBlock.displayRange.end.line
      ) {
        const newStart = prevDisplayBlock.displayRange.end.line + 1
        const blockLength = currBlock.renderedLines.length
        currBlock.displayRange = new vscode.Range(
          newStart,
          0,
          newStart + (blockLength || 1) - 1,
          Number.MAX_SAFE_INTEGER
        )
      }
    }

    return blocksWithRange
  }

  async getDiffBlockDisplayRange(
    blocksWithRange: DiffBlockWithRange[],
    block: DiffBlock
  ): Promise<vscode.Range> {
    const targetBlock = blocksWithRange.find(b => b.id === block.id)
    if (!targetBlock) {
      throw new Error('Block not found')
    }
    return targetBlock.displayRange
  }

  async computeDiff(task: InlineDiffTask) {
    const diffResult = diffLines(task.selectionContent, task.replacementContent)
    let oldLineCount = 0
    let newLineCount = 0

    task.diffBlocks = diffResult
      .map(part => {
        const block = this.createDiffBlock(part, oldLineCount, newLineCount)
        if (part.added) {
          newLineCount += block.newLines.length
        } else if (part.removed) {
          oldLineCount += block.oldLines.length
        } else {
          oldLineCount += block.oldLines.length
          newLineCount += block.newLines.length
        }
        return block
      })
      .filter(this.filterEmptyBlocks)

    task.waitForReviewDiffBlockIds = task.diffBlocks
      .filter(block => block.type !== 'no-change')
      .map(block => block.id)
  }

  async buildDiffContent(
    task: InlineDiffTask,
    blocksWithRange: DiffBlockWithRange[]
  ): Promise<{ content: string; range: vscode.Range }> {
    const startLine = task.selectionRange.start.line
    let endLine = startLine
    let content = ''

    blocksWithRange.forEach((block, index) => {
      if (block.renderedLines.length === 0) {
        return
      }

      endLine = Math.max(endLine, block.displayRange.end.line)
      content += block.renderedLines.join('\n')

      if (
        index < blocksWithRange.length - 1 &&
        blocksWithRange.slice(index + 1).some(b => b.renderedLines.length > 0)
      ) {
        content += '\n'
      }
    })

    if (task.contentAfterSelection) {
      content += `\n${task.contentAfterSelection}`
    }

    const range = new vscode.Range(
      startLine,
      0,
      task.contentAfterSelection
        ? blocksWithRange[blocksWithRange.length - 1]?.displayRange.end.line ||
          startLine
        : endLine,
      Number.MAX_SAFE_INTEGER
    )

    return { content, range }
  }

  private createDiffBlock(
    part: { added?: boolean; removed?: boolean; value: string },
    oldLineCount: number,
    newLineCount: number
  ): DiffBlock {
    const block: DiffBlock = {
      id: uuidv4(),
      oldStart: oldLineCount,
      newStart: newLineCount,
      oldLines: [],
      newLines: [],
      type: 'no-change'
    }

    const lines = this.processContent(part.value)

    if (part.added) {
      block.type = 'add'
      block.newLines = lines
    } else if (part.removed) {
      block.type = 'remove'
      block.oldLines = lines
    } else {
      block.type = 'no-change'
      block.oldLines = lines
      block.newLines = [...lines]
    }

    return block
  }

  private processContent(content: string): string[] {
    if (!content) return []
    const lines = content.split('\n')
    if (lines[lines.length - 1] === '') {
      lines.pop()
    }
    return lines
  }

  private filterEmptyBlocks(block: DiffBlock): boolean {
    if (block.type === 'add') return block.newLines.length > 0
    if (block.type === 'remove') return block.oldLines.length > 0
    return block.oldLines.length > 0
  }

  dispose() {
    this.disposes.forEach(d => d.dispose())
    this.disposes = []
  }
}
