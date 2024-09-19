export const escapeBrackets = (text: string) => {
  const pattern = /(```[\S\s]*?```|`.*?`)|\\\[([\S\s]*?[^\\])\\]|\\\((.*?)\\\)/g
  return text.replaceAll(
    pattern,
    (match, codeBlock, squareBracket, roundBracket) => {
      if (codeBlock) {
        return codeBlock
      }
      if (squareBracket) {
        return `$$${squareBracket}$$`
      }
      if (roundBracket) {
        return `$${roundBracket}$`
      }
      return match
    }
  )
}

export const escapeMhchem = (text: string) =>
  text.replaceAll('$\\ce{', '$\\\\ce{').replaceAll('$\\pu{', '$\\\\pu{')

export const fixMarkdownBold = (text: string): string => {
  let count = 0
  let count2 = 0
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '*') {
      count++
      if (count === 2) {
        count2++
      }
      if (count > 2) {
        result += char
        continue
      }
      if (count === 2 && count2 % 2 === 0) {
        const prevChar = i > 0 ? text[i - 2] : ''
        const isPrevCharAlphanumeric = /[a-zA-Z0-9]/.test(prevChar || '')

        if (
          i + 1 < text.length &&
          text[i + 1] !== ' ' &&
          !isPrevCharAlphanumeric
        ) {
          result += '* '
        } else {
          result += '*'
        }
      } else {
        result += '*'
      }
    } else {
      result += char
      count = 0
    }
  }
  return result
}
