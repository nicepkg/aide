import { TreeSitterLangConfig } from './types'

const scopeQueries = `(program) @scope
(method) @scope
(class) @scope
(method) @scope`

const scopeNodes = ['program', 'method', 'class', 'method']

const definitionQueries = `[
		(class)
(method)
(module)
	] @definition`

const definitionNodes = ['class', 'method', 'module']

const callExpressionQueries = `[
			(call (identifier) @identifier
				(#not-match? @identifier "new|send|public_send|method"))
			(call
				receiver: (identifier)
				method: (identifier) @method
				(#match? @method "^(send|public_send|method)")
				arguments: (argument_list
					(simple_symbol) @symbol))
		] @call_expression`

const classDeclarationQueries = `(class) @class_declaration`

const typeDeclarationQueries = `((constant) @type_identifier) @type_declaration`

const typeIdentifierQueries = `(constant) @type_identifier`

const newExpressionQueries = `((call
			receiver: ((constant) @new_expression)
			method: (identifier) @method)
				(#eq? @method "new"))`

const functionQueries = `[
			(method
				name: (_) @identifier
				parameters: (method_parameters)? @params
				[(_)+ "end"] @body)
			(singleton_method
				name: (_) @identifier
				parameters: (method_parameters)? @params
				[(_)+ "end"] @body)
		] @function`

const docCommentQueries = `((comment)+) @docComment`

const symbolDefinitionQueries = `[
				(method
					name: (identifier) @method.identifier
				) @method

				(singleton_method
					name: (_) @singleton_method.identifier
				) @singleton_method
			]`

const symbolQueries = `[
			(identifier) @symbol
		]`

const statementQueries = `
			[
				(comment) @comment

				(assignment) @assignment

				(if) @if

				(call) @call

				(case) @case

				(when) @when

				(while) @while

				(for) @for

				(method) @method

				(class) @class

				(module) @module

				(begin) @begin
			]
		`

const simpleStatementNodes = ['call', 'assignment']

const controlFlowNodes = ['while', 'for', 'if', 'case']

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
