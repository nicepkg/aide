import path from 'path'
import { PathManager } from '@extension/file-utils/paths'
import { encodingForModel, type Tiktoken } from 'js-tiktoken'
import Parser from 'web-tree-sitter'

import {
  copilotQueriesSupportedExt,
  treeSitterExtLanguageMap
} from './constants'
import { copilotLangsConfig } from './copilot-langs-config'
import { TreeSitterLangConfig } from './copilot-langs-config/types'

interface Range {
  startLine: number
  startColumn: number
  endLine: number
  endColumn: number
}

export interface TextChunk {
  text: string
  range: Range
  type?: string
}

interface ChunkOptions {
  maxTokenLength: number
}

export class CodeChunkerManager {
  private static instance: CodeChunkerManager

  private chunkers: Record<string, CodeChunker> = {}

  private tokenizer: Tiktoken

  private constructor() {
    this.tokenizer = encodingForModel('gpt-4')
  }

  public static getInstance(): CodeChunkerManager {
    if (!CodeChunkerManager.instance) {
      CodeChunkerManager.instance = new CodeChunkerManager()
    }
    return CodeChunkerManager.instance
  }

  async getChunker(language: string): Promise<CodeChunker> {
    if (!this.chunkers[language]) {
      const chunker = new CodeChunker(language, this.tokenizer)
      await chunker.initialize()
      this.chunkers[language] = chunker
    }
    return this.chunkers[language]!
  }

  async getChunkerFromFilePath(filePath: string): Promise<CodeChunker> {
    const ext = PathManager.getExt(filePath).toLowerCase()
    const language = treeSitterExtLanguageMap[ext]

    if (language && copilotQueriesSupportedExt.includes(ext)) {
      return this.getChunker(language)
    }

    return this.getChunker('text')
  }
}

export class CodeChunker {
  private languageWasm?: Parser.Language

  private langConfig?: TreeSitterLangConfig

  private queryCache: Record<string, Parser.Query> = {}

  constructor(
    private language: string,
    private tokenizer: Tiktoken
  ) {
    if (copilotLangsConfig[language as keyof typeof copilotLangsConfig]) {
      this.langConfig =
        copilotLangsConfig[language as keyof typeof copilotLangsConfig]
    }
  }

  private _parser?: Parser

  async getParser() {
    if (!this._parser) {
      await Parser.init()
      this._parser = new Parser()
    }
    return this._parser
  }

  async initialize() {
    if (this.langConfig) {
      const parser = await this.getParser()
      const wasmPath = path.join(
        __EXTENSION_DIST_PATH__,
        `tree-sitter-wasms/tree-sitter-${this.language}.wasm`
      )

      this.languageWasm = await Parser.Language.load(wasmPath)
      parser.setLanguage(this.languageWasm)

      const allowedQueries: (keyof TreeSitterLangConfig['queries'])[] = [
        'statementQueries'
      ]

      // Pre-compile queries
      for (const [queryName, queryString] of Object.entries(
        this.langConfig.queries
      )) {
        if (!allowedQueries.includes(queryName as any)) continue

        this.queryCache[queryName] = this.languageWasm.query(queryString)
      }
    }
  }

  async chunkCode(code: string, options: ChunkOptions): Promise<TextChunk[]> {
    if (this.langConfig && this.languageWasm) {
      return this.chunkCodeWithTreeSitter(code, options)
    }
    return this.chunkCodeBasic(code, options)
  }

  // for support ext files
  private async chunkCodeWithTreeSitter(
    code: string,
    options: ChunkOptions
  ): Promise<TextChunk[]> {
    const parser = await this.getParser()
    const tree = parser!.parse(code)

    const chunks: TextChunk[] = []

    // Use queries to find relevant code structures
    for (const [queryName, query] of Object.entries(this.queryCache)) {
      const matches = query.matches(tree.rootNode)

      for (const match of matches) {
        for (const capture of match.captures) {
          const { node } = capture
          const chunk = this.createChunk(node, queryName.replace('Queries', ''))

          if (this.countTokens(chunk.text) <= options.maxTokenLength) {
            chunks.push(chunk)
          } else {
            // If the chunk is too large, split it
            this.splitLargeChunk(chunk, options, chunks)
          }
        }
      }
    }

    // Sort chunks by their position in the original code
    chunks.sort(
      (a, b) =>
        a.range.startLine - b.range.startLine ||
        a.range.startColumn - b.range.startColumn
    )

    return chunks
  }

  // for other ext files
  private chunkCodeBasic(code: string, options: ChunkOptions): TextChunk[] {
    const lines = code.split('\n')
    const chunks: TextChunk[] = []
    let currentChunk = ''
    let startLine = 0
    let startColumn = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const potentialChunk = `${currentChunk + line}\n`

      if (this.countTokens(potentialChunk) > options.maxTokenLength) {
        if (currentChunk) {
          chunks.push({
            text: currentChunk,
            range: {
              startLine,
              startColumn,
              endLine: i - 1,
              endColumn: lines[i - 1]?.length || 0
            },
            type: 'basic'
          })
        }
        currentChunk = `${line}\n`
        startLine = i
        startColumn = 0
      } else {
        currentChunk = potentialChunk
      }
    }

    if (currentChunk) {
      chunks.push({
        text: currentChunk,
        range: {
          startLine,
          startColumn,
          endLine: lines.length - 1,
          endColumn: lines[lines.length - 1]?.length || 0
        },
        type: 'basic'
      })
    }

    return chunks
  }

  private createChunk(node: Parser.SyntaxNode, type: string): TextChunk {
    return {
      text: node.text,
      range: {
        startLine: node.startPosition.row,
        startColumn: node.startPosition.column,
        endLine: node.endPosition.row,
        endColumn: node.endPosition.column
      },
      type
    }
  }

  private splitLargeChunk(
    chunk: TextChunk,
    options: ChunkOptions,
    chunks: TextChunk[]
  ) {
    const lines = chunk.text.split('\n')
    let currentChunk = ''
    let { startLine } = chunk.range

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const newChunk = `${currentChunk}${line}\n`

      if (this.countTokens(newChunk) > options.maxTokenLength) {
        if (currentChunk) {
          chunks.push({
            text: currentChunk,
            range: {
              startLine,
              startColumn: i === 0 ? chunk.range.startColumn : 0,
              endLine: startLine + currentChunk.split('\n').length - 1,
              endColumn: currentChunk.split('\n').pop()!.length
            },
            type: `${chunk.type}_part`
          })
        }
        currentChunk = `${line}\n`
        startLine = chunk.range.startLine + i
      } else {
        currentChunk = newChunk
      }
    }

    if (currentChunk) {
      chunks.push({
        text: currentChunk,
        range: {
          startLine,
          startColumn:
            startLine === chunk.range.startLine ? chunk.range.startColumn : 0,
          endLine: chunk.range.endLine,
          endColumn: chunk.range.endColumn
        },
        type: `${chunk.type}_part`
      })
    }
  }

  private countTokens(text: string): number {
    return this.tokenizer.encode(text).length
  }
}

// // Usage example
// async function main() {
//   const manager = CodeChunkerManager.getInstance()
//   const chunker = await manager.getChunker('javascript')

//   const code = `
//     function example() {
//       console.log("Hello, world!");
//     }

//     class TestClass {
//       constructor() {
//         this.value = 42;
//       }

//       method() {
//         return this.value;
//       }
//     }
//   `

//   const chunks = await chunker.chunkCode(code, 50)
//   console.log(chunks)
// }

// main()
