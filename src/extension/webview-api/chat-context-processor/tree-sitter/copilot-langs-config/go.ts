import { TreeSitterLangConfig } from './types'

const scopeQueries = `(source_file) @scope
(type_declaration) @scope
(function_declaration) @scope
(method_declaration) @scope`

const scopeNodes = [
  'source_file',
  'type_declaration',
  'function_declaration',
  'method_declaration'
]

const definitionQueries = `[
		(function_declaration)
(method_declaration)
	] @definition`

const definitionNodes = ['function_declaration', 'method_declaration']

const callExpressionQueries = `[
			(call_expression
				((selector_expression
					(field_identifier) @identifier)))
			(call_expression
				(identifier) @identifier)
		] @call_expression`

const classDeclarationQueries = `(type_declaration
			(type_spec
				(type_identifier) @type_identifier)) @class_declaration`

const typeDeclarationQueries = `(type_declaration
			(type_spec
				(type_identifier) @type_identifier)) @type_declaration`

const typeIdentifierQueries = `(type_identifier) @type_identifier`

const newExpressionQueries = `(composite_literal (type_identifier) @new_expression)`

const functionQueries = `[
			(function_declaration
				name: (identifier) @identifier
				body: (block) @body)
			(method_declaration
				name: (field_identifier) @identifier
				body: (block) @body)
		] @function`

const docCommentQueries = `((comment)+) @docComment`

const symbolDefinitionQueries = `[
				(function_declaration
					name: (identifier) @function.identifier
				) @function

				(method_declaration
					name: (field_identifier) @method.identifier
				) @method
			]`

const symbolQueries = `[
			(identifier) @symbol
		]`

const statementQueries = `
		[
			(_statement) @statement
			(function_declaration) @function_declaration
			(import_declaration) @import_declaration
			(method_declaration) @method_declaration
			(package_clause) @package_clause

			(if_statement
				initializer: (_) @for_statement.exclude_captures) @for_statement

			(expression_case) @expression_case ;; e.g., case 0:
		]
		`

const simpleStatementNodes = ['short_var_declaration', 'call_expression']

const controlFlowNodes = [
  'for_statement',
  'if_statement',
  'type_switch_statement'
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
