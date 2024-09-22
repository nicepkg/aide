import { TreeSitterLangConfig } from './types'

const scopeQueries = `(source_file) @scope
(function_item) @scope
(impl_item) @scope
(let_declaration) @scope`

const scopeNodes = [
  'source_file',
  'function_item',
  'impl_item',
  'let_declaration'
]

const definitionQueries = `[
		(function_item)
(impl_item)
(mod_item)
(struct_item)
(trait_item)
(union_item)
	] @definition`

const definitionNodes = [
  'function_item',
  'impl_item',
  'mod_item',
  'struct_item',
  'trait_item',
  'union_item'
]

const callExpressionQueries = `[
			(call_expression (identifier) @identifier)
			(call_expression (field_expression (identifier) (field_identifier) @identifier))
			(call_expression (scoped_identifier (identifier) (identifier) @identifier (#not-match? @identifier "new")))
		] @call_expression`

const classDeclarationQueries = `(impl_item (type_identifier) @type_identifier) @class_declaration`

const typeDeclarationQueries = ``

const typeIdentifierQueries = ``

const newExpressionQueries = `(call_expression
			(scoped_identifier
				(identifier) @new_expression
				(identifier) @identifier
				(#eq? @identifier "new")))`

const functionQueries = `[
			(function_item (identifier) @identifier)
			(let_declaration (identifier) @identifier)
		] @function`

const docCommentQueries = `((line_comment) @comment
			(#match? @comment "^///|^//!"))+ @docComment`

const symbolDefinitionQueries = `[
				(function_item
					(identifier) @function.identifier
				) @function
			]`

const symbolQueries = `[
			(identifier) @symbol
		]`

const statementQueries = ``

const simpleStatementNodes = [
  'expression_statement',
  'let_declaration',
  'use_declaration',
  'assignment_expression',
  'macro_definition',
  'extern_crate_declaration'
]

const controlFlowNodes = [
  'for_statement',
  'if_statement',
  'while_statement',
  'loop_statement',
  'match_expression'
]

export default {
  nodes: {
    scopeNodes,
    controlFlowNodes,
    simpleStatementNodes,
    definitionNodes
  },
  queries: {
    scopeQueries,
    definitionQueries,
    callExpressionQueries,
    classDeclarationQueries,
    typeDeclarationQueries,
    typeIdentifierQueries,
    newExpressionQueries,
    functionQueries,
    docCommentQueries,
    symbolDefinitionQueries,
    symbolQueries,
    statementQueries
  }
} satisfies TreeSitterLangConfig
