/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const fs = require('fs')
const path = require('path')

// ===== Copilot Chat Codes Start =====
function zu(t, e) {
  return Object.fromEntries(t.map(r => [r, e]))
}

const lbe = {
  ...zu(
    ['typescript', 'tsx'],
    [
      'program',
      'interface_declaration',
      'class_declaration',
      'function_declaration',
      'function_expression',
      'type_alias_declaration',
      'method_definition'
    ]
  ),
  javascript: [
    'program',
    'class_declaration',
    'function_declaration',
    'function_expression',
    'method_definition'
  ],
  java: [
    'program',
    'class_declaration',
    'interface_declaration',
    'method_declaration'
  ],
  cpp: ['translation_unit', 'class_specifier', 'function_definition'],
  csharp: [
    'compilation_unit',
    'class_declaration',
    'interface_declaration',
    'method_declaration'
  ],
  python: ['module', 'class_definition', 'function_definition'],
  go: [
    'source_file',
    'type_declaration',
    'function_declaration',
    'method_declaration'
  ],
  ruby: ['program', 'method', 'class', 'method'],
  rust: ['source_file', 'function_item', 'impl_item', 'let_declaration']
}

function Lp(t) {
  return lbe[t].map(e => `(${e}) @scope`).join(`
`)
}

const BWe = {
  ...zu(
    ['typescript', 'tsx'],
    [
      'class_declaration',
      'function_declaration',
      'generator_function_declaration',
      'interface_declaration',
      'internal_module',
      'method_definition',
      'abstract_class_declaration'
    ]
  ),
  javascript: [
    'class_declaration',
    'function_declaration',
    'generator_function_declaration',
    'method_definition'
  ],
  java: [
    'class_declaration',
    'constructor_declaration',
    'enum_declaration',
    'interface_declaration',
    'method_declaration',
    'module_declaration'
  ],
  cpp: [
    'class_specifier',
    'function_definition',
    'namespace_definition',
    'struct_specifier'
  ],
  csharp: [
    'class_declaration',
    'constructor_declaration',
    'destructor_declaration',
    'enum_declaration',
    'interface_declaration',
    'method_declaration',
    'namespace_declaration',
    'struct_declaration'
  ],
  python: ['function_definition', 'class_definition'],
  go: ['function_declaration', 'method_declaration'],
  ruby: ['class', 'method', 'module'],
  rust: [
    'function_item',
    'impl_item',
    'mod_item',
    'struct_item',
    'trait_item',
    'union_item'
  ]
}

function Op(t) {
  return `[
		${BWe[t].map(r => `(${r})`).join(`
`)}
	] @definition`
}

const ar = (() => {
  function t(e, ...r) {
    return e.length === 1
      ? e[0]
      : e.reduce((n, o, s) => `${n}${o}${r[s] || ''}`, '')
  }
  return {
    typescript: t,
    javascript: t,
    python: t,
    go: t,
    ruby: t,
    csharp: t,
    cpp: t,
    java: t,
    rust: t
  }
})()

const FWe = {
  javascript: [],
  typescript: [],
  tsx: [],
  python: [],
  csharp: [],
  go: [],
  java: [],
  ruby: [],
  cpp: [],
  rust: []
}

function $u(t) {
  for (const e in t) {
    const r = t[e]
    FWe[e].push(...r)
  }
  return t
}

const rbe = $u({
  ...zu(
    ['javascript', 'typescript', 'tsx'],
    [
      `[
			(call_expression
				function: (identifier) @identifier)
			(call_expression
				function: (member_expression
					(property_identifier) @identifier))
		] @call_expression`
    ]
  ),
  python: [
    `[
			(call
				function: (identifier) @identifier)
			(call
				function: (attribute
					attribute: (identifier) @identifier))
		] @call_expression`
  ],
  csharp: [
    `[
			(invocation_expression
				function: (identifier) @identifier)
			(invocation_expression
				function: (member_access_expression
					name: (identifier) @identifier))
		] @call_expression`
  ],
  go: [
    `[
			(call_expression
				((selector_expression
					(field_identifier) @identifier)))
			(call_expression
				(identifier) @identifier)
		] @call_expression`
  ],
  java: [
    `[
			(method_invocation
				name: (identifier) @identifier)
		] @call_expression`
  ],
  ruby: [
    `[
			(call (identifier) @identifier
				(#not-match? @identifier "new|send|public_send|method"))
			(call
				receiver: (identifier)
				method: (identifier) @method
				(#match? @method "^(send|public_send|method)")
				arguments: (argument_list
					(simple_symbol) @symbol))
		] @call_expression`
  ],
  cpp: [
    `[
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
  ],
  rust: [
    `[
			(call_expression (identifier) @identifier)
			(call_expression (field_expression (identifier) (field_identifier) @identifier))
			(call_expression (scoped_identifier (identifier) (identifier) @identifier (#not-match? @identifier "new")))
		] @call_expression`
  ]
})
const nbe = $u({
  ...zu(
    ['javascript', 'typescript', 'tsx'],
    ['(class_declaration) @class_declaration']
  ),
  java: ['(class_declaration) @class_declaration'],
  csharp: ['(class_declaration) @class_declaration'],
  python: ['(class_definition) @class_declaration'],
  cpp: ['(class_specifier) @class_declaration'],
  ruby: ['(class) @class_declaration'],
  go: [
    `(type_declaration
			(type_spec
				(type_identifier) @type_identifier)) @class_declaration`
  ],
  rust: ['(impl_item (type_identifier) @type_identifier) @class_declaration']
})
const ibe = $u({
  typescript: [
    `[
			(interface_declaration)
			(type_alias_declaration)
		] @type_declaration`
  ],
  csharp: [
    `(interface_declaration
			(identifier) @type_identifier) @type_declaration`
  ],
  cpp: [
    `[
			(struct_specifier
				(type_identifier) @type_identifier)
			(union_specifier
				(type_identifier) @type_identifier)
			(enum_specifier
				(type_identifier) @type_identifier)
		] @type_declaration`
  ],
  java: [
    `(interface_declaration
			(identifier) @type_identifier) @type_declaration`
  ],
  go: [
    `(type_declaration
			(type_spec
				(type_identifier) @type_identifier)) @type_declaration`
  ],
  ruby: ['((constant) @type_identifier) @type_declaration'],
  python: [
    `(class_definition
			(identifier) @type_identifier) @type_declaration`
  ]
})
const obe = $u({
  typescript: ['(type_identifier) @type_identifier'],
  go: ['(type_identifier) @type_identifier'],
  ruby: ['(constant) @type_identifier'],
  csharp: [
    `[
			(base_list
				(identifier) @type_identifier)
			(variable_declaration
				(identifier) @type_identifier)
		]`
  ],
  cpp: ['(type_identifier) @type_identifier'],
  java: ['(type_identifier) @type_identifier'],
  python: [
    `[
			(type (identifier) @type_identifier)
			(argument_list
				(identifier) @type_identifier)
		]`
  ]
})
const sbe = $u({
  ...zu(
    ['javascript', 'typescript', 'tsx'],
    [
      `(new_expression
			constructor: (identifier) @new_expression)`
    ]
  ),
  python: [
    `(call
			function: (identifier) @new_expression)`
  ],
  csharp: [
    `(object_creation_expression
			(identifier) @new_expression)`
  ],
  java: [
    `(object_creation_expression
			(type_identifier) @new_expression)`
  ],
  cpp: [
    `[
			(declaration
				(type_identifier) @new_expression)
			(class_specifier
				(type_identifier) @new_expression)
		]`
  ],
  go: ['(composite_literal (type_identifier) @new_expression)'],
  ruby: [
    `((call
			receiver: ((constant) @new_expression)
			method: (identifier) @method)
				(#eq? @method "new"))`
  ],
  rust: [
    `(call_expression
			(scoped_identifier
				(identifier) @new_expression
				(identifier) @identifier
				(#eq? @identifier "new")))`
  ]
})
const abe = $u({
  python: [
    `[
			(function_definition
				name: (identifier) @identifier
				body: (block
						(expression_statement (string))? @docstring) @body)
			(assignment
				left: (identifier) @identifier
				right: (lambda) @body)
		] @function`,
    '(ERROR ("def" (identifier) (parameters))) @function'
  ],
  ...zu(
    ['javascript', 'typescript', 'tsx'],
    [
      `[
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
    ]
  ),
  go: [
    `[
			(function_declaration
				name: (identifier) @identifier
				body: (block) @body)
			(method_declaration
				name: (field_identifier) @identifier
				body: (block) @body)
		] @function`
  ],
  ruby: [
    `[
			(method
				name: (_) @identifier
				parameters: (method_parameters)? @params
				[(_)+ "end"] @body)
			(singleton_method
				name: (_) @identifier
				parameters: (method_parameters)? @params
				[(_)+ "end"] @body)
		] @function`
  ],
  csharp: [
    `[
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
  ],
  cpp: [
    `[
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
  ],
  java: [
    `[
			(constructor_declaration
				name: (identifier) @identifier
				body: (constructor_body) @body)
			(method_declaration
				name: (_) @identifier
				body: (block) @body)
			(lambda_expression
				body: (block) @body)
		] @function`
  ],
  rust: [
    `[
			(function_item (identifier) @identifier)
			(let_declaration (identifier) @identifier)
		] @function`
  ]
})
const Bxr = $u({
  javascript: [
    ar.javascript`((comment) @comment
			(#match? @comment "^\\\\/\\\\*\\\\*")) @docComment`
  ],
  ...zu(
    ['typescript', 'tsx'],
    [
      ar.typescript`((comment) @comment
			(#match? @comment "^\\\\/\\\\*\\\\*")) @docComment`
    ]
  ),
  java: [
    ar.java`((block_comment) @block_comment
			(#match? @block_comment "^\\\\/\\\\*\\\\*")) @docComment`
  ],
  cpp: [
    ar.cpp`((comment) @comment
			(#match? @comment "^\\\\/\\\\*\\\\*")) @docComment`
  ],
  csharp: [
    ar.csharp`(
			((comment) @c
				(#match? @c "^\\\\/\\\\/\\\\/"))+
		) @docComment`
  ],
  rust: [
    ar.rust`((line_comment) @comment
			(#match? @comment "^\/\/\/|^\/\/!"))+ @docComment`
  ],
  go: [ar.go`((comment)+) @docComment`],
  ruby: [ar.ruby`((comment)+) @docComment`],
  python: [
    `(expression_statement
			(string) @docComment)`
  ]
})
const hY = $u({
  javascript: [
    ar.javascript`[
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
  ],
  ...zu(
    ['typescript', 'tsx'],
    [
      ar.typescript`[
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
    ]
  ),
  python: [
    ar.python`[
				(function_definition
					name: (identifier) @function.identifier
				) @function
			]`
  ],
  go: [
    ar.go`[
				(function_declaration
					name: (identifier) @function.identifier
				) @function

				(method_declaration
					name: (field_identifier) @method.identifier
				) @method
			]`
  ],
  ruby: [
    ar.ruby`[
				(method
					name: (identifier) @method.identifier
				) @method

				(singleton_method
					name: (_) @singleton_method.identifier
				) @singleton_method
			]`
  ],
  csharp: [
    ar.csharp`[
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
  ],
  cpp: [
    ar.cpp`[
				(function_definition
					(_
						(identifier) @identifier)
				) @function
			]`
  ],
  java: [
    ar.java`(class_declaration
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
  ],
  rust: [
    ar.rust`[
				(function_item
					(identifier) @function.identifier
				) @function
			]`
  ]
})
const cbe = $u({
  javascript: [
    ar.javascript`[
			(identifier) @symbol
			(property_identifier) @symbol
			(private_property_identifier) @symbol
		]`
  ],
  ...zu(
    ['typescript', 'tsx'],
    [
      ar.typescript`[
			(identifier) @symbol
			(type_identifier) @symbol
			(property_identifier) @symbol
			(private_property_identifier) @symbol
		]`
    ]
  ),
  cpp: [
    ar.cpp`[
			(identifier) @symbol
			(type_identifier) @symbol
		]`
  ],
  csharp: [
    ar.csharp`[
			(identifier) @symbol
		]`
  ],
  go: [
    ar.go`[
			(identifier) @symbol
		]`
  ],
  java: [
    ar.java`[
			(identifier) @symbol
		]`
  ],
  python: [
    ar.python`[
			(identifier) @symbol
		]`
  ],
  ruby: [
    ar.ruby`[
			(identifier) @symbol
		]`
  ],
  rust: [
    ar.rust`[
			(identifier) @symbol
		]`
  ]
})
const ube = $u({
  typescript: [
    ar.typescript`
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
			]
		`
  ],
  tsx: [
    ar.typescript`
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
  ],
  python: [
    ar.python`
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
  ],
  javascript: [
    ar.javascript`
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
  ],
  go: [
    ar.go`
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
  ],
  ruby: [
    ar.ruby`
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
  ],
  csharp: [
    ar.csharp`
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
  ],
  cpp: [
    ar.cpp`
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
  ],
  java: [
    ar.java`
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
  ],
  rust: []
})

const dbe = $u({
  typescript: [Lp('typescript')],
  tsx: [Lp('tsx')],
  javascript: [Lp('javascript')],
  java: [Lp('java')],
  cpp: [Lp('cpp')],
  csharp: [Lp('csharp')],
  python: [Lp('python')],
  go: [Lp('go')],
  ruby: [Lp('ruby')],
  rust: [Lp('rust')]
})
const pbe = {
  ...zu(
    ['typescript', 'tsx', 'javascript'],
    [
      'for_in_statement',
      'for_statement',
      'if_statement',
      'while_statement',
      'do_statement',
      'try_statement',
      'switch_statement'
    ]
  ),
  java: [
    'for_statement',
    'enhanced_for_statement',
    'if_statement',
    'while_statement',
    'do_statement',
    'try_statement',
    'switch_expression'
  ],
  cpp: [
    'for_statement',
    'for_range_loop',
    'if_statement',
    'while_statement',
    'do_statement',
    'try_statement',
    'switch_statement'
  ],
  csharp: [
    'for_statement',
    'for_each_statement',
    'if_statement',
    'while_statement',
    'do_statement',
    'try_statement',
    'switch_expression'
  ],
  python: ['for_statement', 'if_statement', 'while_statement', 'try_statement'],
  go: ['for_statement', 'if_statement', 'type_switch_statement'],
  ruby: ['while', 'for', 'if', 'case'],
  rust: [
    'for_statement',
    'if_statement',
    'while_statement',
    'loop_statement',
    'match_expression'
  ]
}
const UWe = {
  ...zu(
    ['typescript', 'tsx'],
    ['lexical_declaration', 'expression_statement', 'public_field_definition']
  ),
  javascript: [
    'call_expression',
    'expression_statement',
    'variable_declaration',
    'public_field_definition'
  ],
  java: [
    'expression_statement',
    'local_variable_declaration',
    'field_declaration'
  ],
  cpp: ['field_declaration', 'expression_statement', 'declaration'],
  csharp: ['field_declaration', 'expression_statement'],
  python: ['expression_statement'],
  go: ['short_var_declaration', 'call_expression'],
  ruby: ['call', 'assignment'],
  rust: [
    'expression_statement',
    'let_declaration',
    'use_declaration',
    'assignment_expression',
    'macro_definition',
    'extern_crate_declaration'
  ]
}

const fbe = $u({
  typescript: [Op('typescript')],
  tsx: [Op('tsx')],
  javascript: [Op('javascript')],
  java: [Op('java')],
  cpp: [Op('cpp')],
  csharp: [Op('csharp')],
  python: [Op('python')],
  go: [Op('go')],
  rust: [Op('rust')],
  ruby: [Op('ruby')]
})

// ===== Copilot Chat Codes End =====

const scopeNodes = lbe
const scopeQueries = dbe
const controlFlowNodes = pbe
const simpleStatementNodes = UWe
const definitionQueries = fbe
const definitionNodes = BWe

const callExpressionQueries = rbe
const classDeclarationQueries = nbe
const typeDeclarationQueries = ibe
const typeIdentifierQueries = obe
const newExpressionQueries = sbe
const functionQueries = abe
const docCommentQueries = Bxr
const symbolDefinitionQueries = hY
const symbolQueries = cbe
const statementQueries = ube
const languageSpecificQueries = FWe

const createTsFileContent = lang => {
  const getQueriesCodes = langQueries => {
    const queries = langQueries[lang] || []
    return `\`${queries
      .join('\n\n')
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')}\``
  }

  const getNodesCodes = langNodes => {
    const nodes = langNodes[lang] || []
    return JSON.stringify(nodes, null, 2)
  }

  const tsContent = `
import { TreeSitterLangConfig } from './types'

const scopeQueries = ${getQueriesCodes(scopeQueries)}

const scopeNodes = ${getNodesCodes(scopeNodes)}

const definitionQueries = ${getQueriesCodes(definitionQueries)}

const definitionNodes = ${getNodesCodes(definitionNodes)}

const callExpressionQueries = ${getQueriesCodes(callExpressionQueries)}

const classDeclarationQueries = ${getQueriesCodes(classDeclarationQueries)}

const typeDeclarationQueries = ${getQueriesCodes(typeDeclarationQueries)}

const typeIdentifierQueries = ${getQueriesCodes(typeIdentifierQueries)}

const newExpressionQueries = ${getQueriesCodes(newExpressionQueries)}

const functionQueries = ${getQueriesCodes(functionQueries)}

const docCommentQueries = ${getQueriesCodes(docCommentQueries)}

const symbolDefinitionQueries = ${getQueriesCodes(symbolDefinitionQueries)}

const symbolQueries = ${getQueriesCodes(symbolQueries)}

const statementQueries = ${getQueriesCodes(statementQueries)}

const simpleStatementNodes = ${getNodesCodes(simpleStatementNodes)}

const controlFlowNodes = ${getNodesCodes(controlFlowNodes)}

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
    statementQueries,
  }
} satisfies TreeSitterLangConfig
`

  return tsContent
}

const BASE_PATH = path.join(
  __dirname,
  '../src/extension/webview-api/chat-context-processor/tree-sitter/scms/copilot-chat'
)

const createTsFiles = async () => {
  const langs = Object.keys(languageSpecificQueries)
  fs.mkdirSync(BASE_PATH, { recursive: true })

  // eslint-disable-next-line no-restricted-syntax
  for (const lang of langs) {
    const content = createTsFileContent(lang)
    const filePath = path.join(BASE_PATH, `${lang}.ts`)

    fs.writeFileSync(filePath, content)

    console.log(`File created: ${filePath}`)
  }
}

createTsFiles()
