import { TreeSitterLangConfig } from './types'

const scopeQueries = `(module) @scope
(class_definition) @scope
(function_definition) @scope`

const scopeNodes = ['module', 'class_definition', 'function_definition']

const definitionQueries = `[
		(function_definition)
(class_definition)
	] @definition`

const definitionNodes = ['function_definition', 'class_definition']

const callExpressionQueries = `[
			(call
				function: (identifier) @identifier)
			(call
				function: (attribute
					attribute: (identifier) @identifier))
		] @call_expression`

const classDeclarationQueries = `(class_definition) @class_declaration`

const typeDeclarationQueries = `(class_definition
			(identifier) @type_identifier) @type_declaration`

const typeIdentifierQueries = `[
			(type (identifier) @type_identifier)
			(argument_list
				(identifier) @type_identifier)
		]`

const newExpressionQueries = `(call
			function: (identifier) @new_expression)`

const functionQueries = `[
			(function_definition
				name: (identifier) @identifier
				body: (block
						(expression_statement (string))? @docstring) @body)
			(assignment
				left: (identifier) @identifier
				right: (lambda) @body)
		] @function

(ERROR ("def" (identifier) (parameters))) @function`

const docCommentQueries = `(expression_statement
			(string) @docComment)`

const symbolDefinitionQueries = `[
				(function_definition
					name: (identifier) @function.identifier
				) @function
			]`

const symbolQueries = `[
			(identifier) @symbol
		]`

const statementQueries = `
			[
				(comment) @comment

				;; simple statements
				(assert_statement) @assert_statement
				(break_statement) @break_statement
				(continue_statement) @continue_statement
				(delete_statement) @delete_statement
				(exec_statement) @exec_statement
				(expression_statement) @expression_statement
				(future_import_statement) @future_import_statement
				(global_statement) @global_statement
				(import_from_statement) @import_from_statement
				(import_statement) @import_statement
				(nonlocal_statement) @nonlocal_statement
				(pass_statement) @pass_statement
				(print_statement) @print_statement
				(raise_statement) @raise_statement
				(return_statement) @return_statement
				(type_alias_statement) @type_alias_statement


				;; compound statements

				(class_definition) @class_definition
				(decorated_definition) @decorated_definition
				(for_statement) @for_statement
				(function_definition) @function_definition
				(if_statement) @if_statement
				(try_statement) @try_statement
				(while_statement) @while_statement
				(with_statement) @with_statement


				;; expressions

				(expression_list) @expression_list
				(expression_statement) @expression_statement
			]
		`

const simpleStatementNodes = ['expression_statement']

const controlFlowNodes = [
  'for_statement',
  'if_statement',
  'while_statement',
  'try_statement'
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
