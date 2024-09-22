import { TreeSitterLangConfig } from './types'

const scopeQueries = `(program) @scope
(class_declaration) @scope
(interface_declaration) @scope
(method_declaration) @scope`

const scopeNodes = [
  'program',
  'class_declaration',
  'interface_declaration',
  'method_declaration'
]

const definitionQueries = `[
		(class_declaration)
(constructor_declaration)
(enum_declaration)
(interface_declaration)
(method_declaration)
(module_declaration)
	] @definition`

const definitionNodes = [
  'class_declaration',
  'constructor_declaration',
  'enum_declaration',
  'interface_declaration',
  'method_declaration',
  'module_declaration'
]

const callExpressionQueries = `[
			(method_invocation
				name: (identifier) @identifier)
		] @call_expression`

const classDeclarationQueries = `(class_declaration) @class_declaration`

const typeDeclarationQueries = `(interface_declaration
			(identifier) @type_identifier) @type_declaration`

const typeIdentifierQueries = `(type_identifier) @type_identifier`

const newExpressionQueries = `(object_creation_expression
			(type_identifier) @new_expression)`

const functionQueries = `[
			(constructor_declaration
				name: (identifier) @identifier
				body: (constructor_body) @body)
			(method_declaration
				name: (_) @identifier
				body: (block) @body)
			(lambda_expression
				body: (block) @body)
		] @function`

const docCommentQueries = `((block_comment) @block_comment
			(#match? @block_comment "^\\\\/\\\\*\\\\*")) @docComment`

const symbolDefinitionQueries = `(class_declaration
			name: (_) @class.identifier
			body: (_
						[
							(constructor_declaration
								(modifiers)? @constructor.modifiers
								(#not-eq? @constructor.modifiers "private")
								name: (identifier) @constructor.identifier
							) @constructor

							(method_declaration
								(modifiers)? @method.modifiers
								(#not-eq? @method.modifiers "private")
								name: (identifier) @method.identifier
							) @method
						]
					)
		) @class`

const symbolQueries = `[
			(identifier) @symbol
		]`

const statementQueries = `
		[
			(statement) @statement ;; @ulugbekna: this includes (declaration); but somehow it can't capture inner classes

			(line_comment) @line_comment
			(block_comment) @block_comment

			(for_statement
				init: (_) @for_statement.exclude_captures)

			(block) @block.exclude_captures

			(field_declaration) @field_declaration
		]
		`

const simpleStatementNodes = [
  'expression_statement',
  'local_variable_declaration',
  'field_declaration'
]

const controlFlowNodes = [
  'for_statement',
  'enhanced_for_statement',
  'if_statement',
  'while_statement',
  'do_statement',
  'try_statement',
  'switch_expression'
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
