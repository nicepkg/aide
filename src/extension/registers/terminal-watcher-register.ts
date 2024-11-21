/* eslint-disable no-control-regex */
import { logger } from '@extension/logger'
import stripAnsi from 'strip-ansi'
import * as vscode from 'vscode'

import { BaseRegister } from './base-register'

export interface TerminalCommand {
  cwd: string | undefined
  input: string
  output: string
  exitCode?: number
}

export interface TerminalInfo {
  processId: number
  name: string
  commands: TerminalCommand[]
}

export class TerminalWatcherRegister extends BaseRegister {
  private terminalInfos = new Map<number, TerminalInfo>()

  private disposes: vscode.Disposable[] = []

  async register(): Promise<void> {
    this.disposes.push(
      vscode.window.onDidOpenTerminal(this.handleTerminalOpen.bind(this)),
      vscode.window.onDidCloseTerminal(this.handleTerminalClose.bind(this)),

      vscode.window.onDidStartTerminalShellExecution(
        this.handleCommandStart.bind(this)
      ),
      vscode.window.onDidEndTerminalShellExecution(
        this.handleCommandEnd.bind(this)
      )
    )

    vscode.window.terminals.forEach(terminal => {
      this.handleTerminalOpen(terminal)
    })
  }

  private async handleTerminalOpen(terminal: vscode.Terminal) {
    const processId = await terminal.processId
    if (!processId) return

    this.terminalInfos.set(processId, {
      processId,
      name: terminal.name,
      commands: []
    })
  }

  private async handleTerminalClose(terminal: vscode.Terminal) {
    const processId = await terminal.processId
    if (!processId) return

    this.terminalInfos.delete(processId)
  }

  private async handleCommandStart(
    event: vscode.TerminalShellExecutionStartEvent
  ) {
    const { terminal } = event
    const processId = await terminal.processId
    if (!processId) return

    const info = this.terminalInfos.get(processId)
    if (!info) return

    info.commands.push({
      cwd: event.execution.cwd?.fsPath,
      input: event.execution.commandLine.value,
      output: ''
    })

    if (info.commands.length > 5) {
      info.commands.shift()
    }

    await this.readCommandOutput(event.execution, processId)
  }

  private async readCommandOutput(
    execution: vscode.TerminalShellExecution,
    terminalProcessId: number
  ) {
    // see: https://github.com/cline/cline/blob/main/src/integrations/terminal/TerminalProcess.ts
    try {
      const stream = execution.read()
      let isFirstChunk = true

      for await (let data of stream) {
        const info = this.terminalInfos.get(terminalProcessId)
        if (!info || info.commands.length === 0) return

        const lastCommand = info.commands[info.commands.length - 1]
        if (lastCommand) {
          // Process the output data
          if (isFirstChunk) {
            data = this.processFirstChunk(data, lastCommand.input)
            isFirstChunk = false
          } else {
            data = stripAnsi(data)
            // Remove random commas (FIXME: temporary fix for shell integration issue)
            data = data.replace(/,/g, '')
          }

          data = this.removeLastLineArtifacts(data)

          if (data.trim()) {
            lastCommand.output += data
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to read terminal output:', error)
    }
  }

  private processFirstChunk(data: string, command: string): string {
    // Extract output between shell integration sequences
    const outputBetweenSequences = this.removeLastLineArtifacts(
      data.match(/\]633;C([\s\S]*?)\]633;D/)?.[1] || ''
    ).trim()

    // Remove VSCode shell integration sequences
    const vscodeSequenceRegex = /\x1b\]633;.[^\x07]*\x07/g
    const lastMatch = [...data.matchAll(vscodeSequenceRegex)].pop()
    if (lastMatch && lastMatch.index !== undefined) {
      data = data.slice(lastMatch.index + lastMatch[0].length)
    }

    // Place extracted output back
    if (outputBetweenSequences) {
      data = `${outputBetweenSequences}\n${data}`
    }

    // Remove ANSI escape sequences
    data = stripAnsi(data)

    // Process lines
    let lines = data ? data.split('\n') : []

    // Clean up first line
    if (lines.length > 0) {
      // Remove non-printable characters
      lines[0] = lines[0]!.replace(/[^\x20-\x7E]/g, '')
      // Remove duplicate first character
      if (lines[0].length >= 2 && lines[0][0] === lines[0][1]) {
        lines[0] = lines[0].slice(1)
      }
      // Remove non-alphanumeric prefix
      lines[0] = lines[0].replace(/^[^a-zA-Z0-9]*/, '')
    }

    // Clean up second line if exists
    if (lines.length > 1) {
      lines[1] = lines[1]!.replace(/^[^a-zA-Z0-9]*/, '')
    }

    // Remove command echo
    lines = lines.filter(line => !command.includes(line.trim()))

    return lines.join('\n')
  }

  private removeLastLineArtifacts(output: string): string {
    const lines = output.trimEnd().split('\n')
    if (lines.length > 0) {
      // Remove prompt characters and trailing whitespace from the last line
      const lastLine = lines[lines.length - 1]

      if (lastLine) {
        lines[lines.length - 1] = lastLine.replace(/[%$#>]\s*$/, '')
      }
    }
    return lines.join('\n').trimEnd()
  }

  private async handleCommandEnd(event: vscode.TerminalShellExecutionEndEvent) {
    const processId = await event.terminal.processId
    if (!processId) return

    const info = this.terminalInfos.get(processId)
    if (!info || info.commands.length === 0) return

    const lastCommand = info.commands[info.commands.length - 1]
    if (lastCommand) {
      lastCommand.exitCode = event.exitCode
    }
  }

  async executeCommand(
    terminal: vscode.Terminal,
    command: string
  ): Promise<void> {
    if (terminal.shellIntegration) {
      terminal.shellIntegration.executeCommand(command)
    } else {
      terminal.sendText(command)
    }
  }

  getTerminalInfo(terminalProcessId: number): TerminalInfo | null {
    return this.terminalInfos.get(terminalProcessId) || null
  }

  getAllTerminalInfos(): TerminalInfo[] {
    return Array.from(this.terminalInfos.values())
  }

  getTerminalProcessIds(): number[] {
    return Array.from(this.terminalInfos.keys())
  }

  dispose(): void {
    this.terminalInfos.clear()
    this.disposes.forEach(dispose => dispose.dispose())
    this.disposes = []
  }
}
