export type TreeSitterLangConfig = {
  nodes: {
    scopeNodes: string[]
    controlFlowNodes: string[]
    simpleStatementNodes: string[]
    definitionNodes: string[]
  }
  queries: {
    scopeQueries: string
    definitionQueries: string
    callExpressionQueries: string
    classDeclarationQueries: string
    typeDeclarationQueries: string
    typeIdentifierQueries: string
    newExpressionQueries: string
    functionQueries: string
    docCommentQueries: string
    symbolDefinitionQueries: string
    symbolQueries: string
    statementQueries: string
  }
}
