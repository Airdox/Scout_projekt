 @member {boolean} Variable#stack
         */
        this.stack = true;

        /**
         * Reference to the enclosing Scope.
         * @member {Scope} Variable#scope
         */
        this.scope = scope;
    }
}

Variable.CatchClause = "CatchClause";
Variable.Parameter = "Parameter";
Variable.FunctionName = "FunctionName";
Variable.ClassName = "ClassName";
Variable.Variable = "Variable";
Variable.ImportBinding = "ImportBinding";
Variable.ImplicitGlobalVariable = "ImplicitGlobalVariable";

/* vim: set sw=4 ts=4 et tw=80 : */

/*
  Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @constructor Definition
 */
class Definition {
    constructor(type, name, node, parent, index, kind) {

        /**
         * @member {string} Definition#type - type of the occurrence (e.g. "Parameter", "Variable", ...).
         */
        this.type = type;

        /**
         * @member {espree.Identifier} Definition#name - the identifier AST node of the occurrence.
         */
        this.name = name;

        /**
         * @member {espree.Node} Definition#node - the enclosing node of the identifier.
         */
        this.node = node;

        /**
         * @member {espree.Node?} Definition#parent - the enclosing statement node of the identifier.
         */
        this.parent = parent;

        /**
         * @member {number?} Definition#index - the index in the declaration statement.
         */
        this.index = index;

        /**
         * @member {string?} Definition#kind - the kind of the declaration statement.
         */
        this.kind = kind;
    }
}

/**
 * @constructor ParameterDefinition
 */
class ParameterDefinition extends Definition {
    constructor(name, node, index, rest) {
        super(Variable.Parameter, name, node, null, index, null);

        /**
         * Whether the parameter definition is a part of a rest parameter.
         * @member {boolean} ParameterDefinition#rest
         */
        this.rest = rest;
    }
}

/* vim: set sw=4 ts=4 et tw=80 : */

/*
  Copyright (C) 2015 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

const { Syntax: Syntax$2 } = estraverse__default["default"];

/**
 * Test if scope is struct
 * @param {Scope} scope scope
 * @param {Block} block block
 * @param {boolean} isMethodDefinition is method definition
 * @returns {boolean} is strict scope
 */
function isStrictScope(scope, block, isMethodDefinition) {
    let body;

    // When upper scope is exists and strict, inner scope is also strict.
    if (scope.upper && scope.upper.isStrict) {
        return true;
    }

    if (isMethodDefinition) {
        return true;
    }

    if (scope.type === "class" || scope.type === "module") {
        return true;
    }

    if (scope.type === "block" || scope.type === "switch") {
        return false;
    }

    if (scope.type === "function") {
        if (block.type === Syntax$2.ArrowFunctionExpression && block.body.type !== Syntax$2.BlockStatement) {
            return false;
        }

        if (block.type === Syntax$2.Program) {
            body = block;
        } else {
            body = block.body;
        }

        if (!body) {
            return false;
        }
    } else if (scope.type === "global") {
        body = block;
    } else {
        return false;
    }

    // Search for a 'use strict' directive.
    for (let i = 0, iz = body.body.length; i < iz; ++i) {
        const stmt = body.body[i];

        /*
         * Check if the current statement is a directive.
         * If it isn't, then we're past the directive prologue
         * so stop the search because directives cannot
         * appear after this point.
         *
         * Some parsers set `directive: