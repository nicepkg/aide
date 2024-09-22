import { TreeSitterLangConfig } from './types'

const scopeQueries = `(compilation_unit) @scope
(class_declaration) @scope
(interface_declaration) @scope
(method_declaration) @scope`

const scopeNodes = [
  'compilation_unit',
  'class_declaration',
  'interface_declaration',
  'method_declaration'
]

const definitionQueries = `[
		(class_declaration)
(constructor_declaration)
(destructor_declaration)
(enum_declaration)
(interface_declaration)
(method_declaration)
(namespace_declaration)
(struct_declaration)
	] @definition`

const definitionNodes = [
  'class_declaration',
  'constructor_declaration',
  'destructor_declaration',
  'enum_declaration',
  'interface_declaration',
  'method_declaration',
  'namespace_declaration',
  'struct_declaration'
]

const callExpressionQueries = `[
			(invocation_expression
				function: (identifier) @identifier)
			(invocation_expression
				function: (member_access_expression
					name: (identifier) @identifier))
		] @call_expression`

const classDeclarationQueries = `(class_declaration) @class_declaration`

const typeDeclarationQueries = `(interface_declaration
			(identifier) @type_identifier) @type_declaration`

const typeIdentifierQueries = `[
			(base_list
				(identifier) @type_identifier)
			(variable_declaration
				(identifier) @type_identifier)
		]`

const newExpressionQueries = `(object_creation_expression
			(identifier) @new_expression)`

const functionQueries = `[
			(constructor_declaration
				(identifier) @identifier
				(block) @body)
			(destructor_declaration
				(identifier) @identifier
				(block) @body)
			(operator_declaration
				(block) @body)
			(method_declaration
				(identifier) @identifier
				(block) @body)
			(local_function_statement
				(identifier) @identifier
				(block) @body)
		] @function`

const docCommentQueries = `(
			((comment) @c
				(#match? @c "^\\\\/\\\\/\\\\/"))+
		) @docComment`

const symbolDefinitionQueries = `[
				(constructor_declaration
					(identifier) @constructor.identifier
				) @constructor

				(destructor_declaration
					(identifier) @destructor.identifier
				) @destructor

				(method_declaration
					(identifier) @method.identifier
				) @method

				(local_function_statement
					(identifier) @local_function.identifier
				) @local_function
			]`

const symbolQueries = `[
			(identifier) @symbol
		]`

const statementQueries = `
			[
				(comment) @comment

				(class_declaration) @class_declaration
				(constructor_declaration) @constructor_declaration
				(method_declaration) @method_declaration
				(delegate_declaration) @delegate_declaration
				(enum_declaration) @enum_declaration
				(extern_alias_directive) @extern_alias_directive
				(file_scoped_namespace_declaration) @file_scoped_namespace_declaration
				(global_attribute) @global_attribute
				(global_statement) @global_statement
				(interface_declaration) @interface_declaration
				(namespace_declaration) @namespace_declaration
				(record_declaration) @record_declaration
				(struct_declaration) @struct_declaration
				(using_directive) @using_directive

				(local_declaration_statement) @local_declaration_statement
				(expression_statement) @expression_statement
				(for_statement) @for_statement
				(foreach_statement) @foreach_statement
				(continue_statement) @continue_statement
				(break_statement) @break_statement
				(throw_statement) @throw_statement
				(return_statement) @return_statement
				(try_statement) @try_statement
			]
		`

const simpleStatementNodes = ['field_declaration', 'expression_statement']

const controlFlowNodes = [
  'for_statement',
  'for_each_statement',
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
