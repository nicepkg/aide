import { TreeSitterLangConfig } from './types'

const scopeQueries = `(program) @scope
(class_declaration) @scope
(function_declaration) @scope
(function_expression) @scope
(method_definition) @scope`

const scopeNodes = [
  'program',
  'class_declaration',
  'function_declaration',
  'function_expression',
  'method_definition'
]

const definitionQueries = `[
		(class_declaration)
(function_declaration)
(generator_function_declaration)
(method_definition)
	] @definition`

const definitionNodes = [
  'class_declaration',
  'function_declaration',
  'generator_function_declaration',
  'method_definition'
]

const callExpressionQueries = `[
			(call_expression
				function: (identifier) @identifier)
			(call_expression
				function: (member_expression
					(property_identifier) @identifier))
		] @call_expression`

const classDeclarationQueries = `(class_declaration) @class_declaration`

const typeDeclarationQueries = ``

const typeIdentifierQueries = ``

const newExpressionQueries = `(new_expression
			constructor: (identifier) @new_expression)`

const functionQueries = `[
			(function_expression
				name: (identifier)? @identifier
				body: (statement_block) @body)
			(function_declaration
				name: (identifier)? @identifier
				body: (statement_block) @body)
			(generator_function
				name: (identifier)? @identifier
				body: (statement_block) @body)
			(generator_function_declaration
				name: (identifier)? @identifier
				body: (statement_block) @body)
			(method_definition
				name: (property_identifier)? @identifier
				body: (statement_block) @body)
			(arrow_function
				body: (statement_block) @body)
		] @function`

const docCommentQueries = `((comment) @comment
			(#match? @comment "^\\\\/\\\\*\\\\*")) @docComment`

const symbolDefinitionQueries = `[
			(function_declaration
				(identifier) @function.identifier
			) @function

			(generator_function_declaration
				name: (identifier) @generator_function.identifier
			) @generator_function

			(class_declaration
				name: (identifier) @class.identifier ;; note: (type_identifier) in typescript
				body: (class_body
							(method_definition
								name: (property_identifier) @method.identifier
							) @method
						)
			) @class
		]`

const symbolQueries = `[
			(identifier) @symbol
			(property_identifier) @symbol
			(private_property_identifier) @symbol
		]`

const statementQueries = `
			[
				(comment) @comment ;; split into multiple comment kinds?

				(declaration) @declaration

				;; class declaration related

				(field_definition) @field_definition
				(method_definition) @method_definition

				;; statements

				(import_statement) @import_statement
				(export_statement) @export_statement

				(expression_statement) @expression_statement

				(for_in_statement) @for_in_statement
				;; exclude any children found in the for loop condition
				(for_statement condition: (_) @for_statement.exclude_captures ) @for_statement
				(break_statement) @break_statement
				(continue_statement) @continue_statement
				(do_statement) @do_statement
				(if_statement) @if_statement
				(switch_statement) @switch_statement
				(switch_case) @switch_case
				(try_statement) @try_statement
				(throw_statement) @throw_statement
				(debugger_statement) @debugger_statement
				(return_statement) @return_statement
			]`

const simpleStatementNodes = [
  'call_expression',
  'expression_statement',
  'variable_declaration',
  'public_field_definition'
]

const controlFlowNodes = [
  'for_in_statement',
  'for_statement',
  'if_statement',
  'while_statement',
  'do_statement',
  'try_statement',
  'switch_statement'
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
