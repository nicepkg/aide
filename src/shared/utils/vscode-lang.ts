export const languageIdExtMap = {
  abap: ['abap'],
  bat: ['bat', 'cmd'],
  bibtex: ['bib'],
  clojure: ['clj', 'cljs', 'cljc'],
  coffeescript: ['coffee'],
  c: ['c'],
  cpp: ['cpp', 'cxx', 'cc'],
  csharp: ['cs'],
  dockercompose: ['docker-compose.yml', 'docker-compose.yaml'],
  css: ['css'],
  'cuda-cpp': ['cu', 'cuh'],
  d: ['d'],
  pascal: ['pas', 'p'],
  diff: ['diff', 'patch'],
  dockerfile: ['Dockerfile'],
  erlang: ['erl', 'hrl'],
  fsharp: ['fs', 'fsi', 'fsx'],
  'git-commit': ['COMMIT_EDITMSG'],
  'git-rebase': ['git-rebase-todo'],
  go: ['go'],
  groovy: ['groovy', 'gvy', 'gy', 'gsh'],
  handlebars: ['hbs', 'handlebars'],
  haml: ['haml'],
  haskell: ['hs', 'lhs'],
  html: ['html', 'htm'],
  ini: ['ini'],
  java: ['java'],
  javascript: ['js', 'mjs'],
  javascriptreact: ['jsx'],
  json: ['json'],
  jsonc: ['jsonc'],
  julia: ['jl'],
  latex: ['tex'],
  less: ['less'],
  lua: ['lua'],
  makefile: ['makefile', 'mk'],
  markdown: ['md', 'markdown'],
  'objective-c': ['m'],
  'objective-cpp': ['mm'],
  ocaml: ['ml', 'mli'],
  perl: ['pl', 'pm'],
  perl6: ['p6', 'pl6'],
  php: ['php'],
  plaintext: ['txt'],
  powershell: ['ps1', 'psm1', 'psd1'],
  jade: ['jade'],
  pug: ['pug'],
  python: ['py'],
  r: ['r', 'R'],
  razor: ['cshtml'],
  ruby: ['rb'],
  rust: ['rs'],
  scss: ['scss'],
  sass: ['sass'],
  shaderlab: ['shader'],
  shellscript: ['sh', 'bash'],
  slim: ['slim'],
  sql: ['sql'],
  stylus: ['styl'],
  svelte: ['svelte'],
  swift: ['swift'],
  typescript: ['ts'],
  typescriptreact: ['tsx'],
  tex: ['tex'],
  vb: ['vb'],
  vue: ['vue'],
  'vue-html': ['vue-html'],
  xml: ['xml'],
  xsl: ['xsl', 'xslt'],
  yaml: ['yml', 'yaml']
}

export const languageIds = Object.keys(languageIdExtMap)
export const languageIdExts = Object.values(languageIdExtMap).flat()
export const languageExtIdMap = Object.fromEntries(
  Object.entries(languageIdExtMap).flatMap(([id, exts]) =>
    exts.map(ext => [ext, id])
  )
)

export const getLanguageIdExt = (languageIdORExt: string): string => {
  if (languageIdExts.includes(languageIdORExt)) return languageIdORExt

  return (
    languageIdExtMap[languageIdORExt as keyof typeof languageIdExtMap]?.[0] ||
    ''
  )
}

export const getLanguageId = (languageIdORExt: string): string => {
  if (languageIds.includes(languageIdORExt)) return languageIdORExt
  if (languageIdExts.includes(languageIdORExt)) {
    return (
      languageExtIdMap[languageIdORExt as keyof typeof languageExtIdMap] ||
      languageIdORExt
    )
  }

  return languageIdORExt
}