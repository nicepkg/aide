import { TreeSitterLangConfig } from './types'

const scopeQueries = `(translation_unit) @scope
(class_specifier) @scope
(function_definition) @scope`

const scopeNodes = [
  'translation_unit',
  'class_specifier',
  'function_definition'
]

const definitionQueries = `[
		(class_specifier)
(function_definition)
(namespace_definition)
(struct_specifier)
	] @definition`

const definitionNodes = [
  'class_specifier',
  'function_definition',
  'namespace_definition',
  'struct_specifier'
]

const callExpressionQueries = `[
			(function_declarator
				(identifier) @identifier)
			(function_declarator
				(field_identifier) @identifier)
			(call_expression (identifier) @identifier)
			(call_expression
				(field_expression
					field: (field_identifier) @identifier))
			(call_expression
				(call_expression
					(primitive_type)
					(argument_list
						(pointer_expression
						(identifier) @identifier))))
		] @call_expression`

const classDeclarationQueries = `(class_specifier) @class_declaration`

const typeDeclarationQueries = `[
			(struct_specifier
				(type_identifier) @type_identifier)
			(union_specifier
				(type_identifier) @type_identifier)
			(enum_specifier
				(type_identifier) @type_identifier)
		] @type_declaration`

const typeIdentifierQueries = `(type_identifier) @type_identifier`

const newExpressionQueries = `[
			(declaration
				(type_identifier) @new_expression)
			(class_specifier
				(type_identifier) @new_expression)
		]`

const functionQueries = `[
			(function_definition
				(_
					(identifier) @identifier)
					(compound_statement) @body)
			(function_definition
				(function_declarator
					(qualified_identifier
						(identifier) @identifier))
					(compound_statement) @body)
		] @function`

const docCommentQueries = `((comment) @comment
			(#match? @comment "^\\\\/\\\\*\\\\*")) @docComment`

const symbolDefinitionQueries = `[
				(function_definition
					(_
						(identifier) @identifier)
				) @function
			]`

const symbolQueries = `[
			(identifier) @symbol
			(type_identifier) @symbol
		]`

const statementQueries = `
			[
				(declaration) @declaration

				(expression_statement) @expression_statement

				(comment) @comment

				(preproc_include) @preproc_include

				(namespace_definition) @namespace_definition

				(enum_specifier) @enum_specifier

				(struct_specifier) @struct_specifier

				(template_declaration) @template_declaration

				(function_definition) @function_definition

				(return_statement) @return_statement

				(class_specifier) @class_specifier

				(try_statement) @try_statement

				(throw_statement) @throw_statement

				(for_statement) @for_statement
				(for_statement
					initializer:(_) @for_statement.exclude_captures) @for_statement

				(for_range_loop) @for_range_loop
			]
		`

const simpleStatementNodes = [
  'field_declaration',
  'expression_statement',
  'declaration'
]

const controlFlowNodes = [
  'for_statement',
  'for_range_loop',
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
