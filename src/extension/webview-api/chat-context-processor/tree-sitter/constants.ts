import { copilotLangsConfig } from './copilot-langs-config'
import { codeSnippetQueries } from './queries/code-snippet-queries'
import { tagsQueries } from './queries/tags-queries'

// see: https://github.com/continuedev/continue/blob/main/core/util/treeSitter.ts
export const treeSitterExtLanguageMap: Record<string, string> = {
  // JavaScript
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',

  // TypeScript
  ts: 'typescript',
  tsx: 'tsx',
  mts: 'typescript',
  cts: 'typescript',

  // Python
  py: 'python',
  pyw: 'python',
  pyi: 'python',

  // Ruby
  rb: 'ruby',
  erb: 'ruby',

  // Rust
  rs: 'rust',

  // PHP
  php: 'php',
  phtml: 'php',
  php3: 'php',
  php4: 'php',
  php5: 'php',
  php7: 'php',
  phps: 'php',
  'php-s': 'php',

  // Go
  go: 'go',

  // C++
  cpp: 'cpp',
  cxx: 'cpp',
  cc: 'cpp',
  hpp: 'cpp',
  hxx: 'cpp',
  // Depended on this PR: https://github.com/tree-sitter/tree-sitter-cpp/pull/173
  // ccm: "cpp",
  // c++m: "cpp",
  // cppm: "cpp",
  // cxxm: "cpp",

  // C
  c: 'c',
  h: 'c',

  // C#
  cs: 'c_sharp',

  // CSS
  css: 'css',

  // Java
  java: 'java',

  // Swift
  swift: 'swift',

  // Julia
  jl: 'julia',

  // Kotlin
  kt: 'kotlin',

  // Scala
  scala: 'scala',

  // Lua
  lua: 'lua',

  // Elixir
  ex: 'elixir',
  exs: 'elixir',

  // OCaml
  ml: 'ocaml',
  mli: 'ocaml',
  ocaml: 'ocaml',

  // Elisp (Emacs Lisp)
  el: 'elisp',
  elisp: 'elisp',
  emacs: 'elisp',

  // Bash
  bash: 'bash',
  sh: 'bash',

  // JSON
  json: 'json',

  // TOML
  toml: 'toml',

  // Elm
  elm: 'elm',

  // Ql
  ql: 'ql',

  // Solidity
  sol: 'solidity',

  // Rescript
  res: 'rescript',
  resi: 'rescript',

  // SystemRDL
  rdl: 'systemrdl',

  // Embedded Templates
  eex: 'embedded_template',
  heex: 'embedded_template',
  leex: 'embedded_template',

  // HTML
  html: 'html',
  htm: 'html'

  // // Vue
  // vue: 'vue', // tree-sitter-vue parser is broken

  // // YAML
  // // The .wasm file being used is faulty, and yaml is split line-by-line anyway for the most part
  // yaml: 'yaml',
  // yml: 'yaml'
}

const getSupportExtFromQueries = (queries: Record<string, any>) => {
  const supportedLanguages = Object.keys(queries)
  return Object.entries(treeSitterExtLanguageMap)
    .filter(([_, language]) => supportedLanguages.includes(language))
    .map(([ext]) => ext)
}

export const tagQueriesSupportedExt = getSupportExtFromQueries(tagsQueries)
export const codeSnippetQueriesSupportedExt =
  getSupportExtFromQueries(codeSnippetQueries)
export const copilotQueriesSupportedExt =
  getSupportExtFromQueries(copilotLangsConfig)
