import { TreeSitterLangConfig } from './types'

const scopeQueries = `(program) @scope
(interface_declaration) @scope
(class_declaration) @scope
(function_declaration) @scope
(function_expression) @scope
(type_alias_declaration) @scope
(method_definition) @scope`

const scopeNodes = [
  'program',
  'interface_declaration',
  'class_declaration',
  'function_declaration',
  'function_expression',
  'type_alias_declaration',
  'method_definition'
]

const definitionQueries = `[
		(class_declaration)
(function_declaration)
(generator_function_declaration)
(interface_declaration)
(internal_module)
(method_definition)
(abstract_class_declaration)
	] @definition`

const definitionNodes = [
  'class_declaration',
  'function_declaration',
  'generator_function_declaration',
  'interface_declaration',
  'internal_module',
  'method_definition',
  'abstract_class_declaration'
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
					name: (type_identifier) @class.identifier
					body: (class_body
								(method_definition
									(accessibility_modifier)? @method.accessibility_modifier
									name: (property_identifier) @method.identifier
									(#not-eq? @method.accessibility_modifier "private")
								) @method
							)
				) @class
			]`

const symbolQueries = `[
			(identifier) @symbol
			(type_identifier) @symbol
			(property_identifier) @symbol
			(private_property_identifier) @symbol
		]`

const statementQueries = `
			[
				(comment) @comment ;; split into multiple comment kinds?

				(declaration) @declaration

				;; class declaration related
				(public_field_definition) @public_field_definition
				(method_definition) @method_definition
				(class_declaration (_ (method_signature) @method_signature))
				(abstract_method_signature) @abstract_method_signature

				;; enum declaration related
				(enum_assignment) @enum_assignment

				;; interface declaration related
				(interface_declaration (_ (method_signature) @method_signature))
				(interface_declaration (_ (property_signature) @property_signature))

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
				(if_statement
					consequence: [
						(expression_statement)
						(if_statement)
					] @if_statement.exclude_captures)
				(else_clause
					[
						(expression_statement)
						(if_statement) ; for if-else chains
					] @else_clause.exclude_captures)
				(switch_statement) @switch_statement
				(switch_case) @switch_case
				(try_statement) @try_statement
				(throw_statement) @throw_statement
				(debugger_statement) @debugger_statement
				(return_statement) @return_statement

				;; jsx
				(jsx_element) @jsx_element
				(jsx_element (_ (jsx_expression) @jsx_expression))
			]
		`

const simpleStatementNodes = [
  'lexical_declaration',
  'expression_statement',
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
