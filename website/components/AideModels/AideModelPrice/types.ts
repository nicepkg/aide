export type TokenPrice = {
  type: 'tokenPrice'
  ratio: number
  completionRatio: number
  inputMillionPrice: number
  outputMillionPrice: number
}

export type FixedPrice = {
  type: 'fixedPrice'
  fixedPrice: number
}

export type ModelPrice = {
  [modelName: string]: TokenPrice | FixedPrice
}
