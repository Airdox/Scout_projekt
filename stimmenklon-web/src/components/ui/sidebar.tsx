cCloseRef(ref) {
        if (!this.__resolve(ref)) {
            this.__delegateToUpperScope(ref);
        }
    }

    __dynamicCloseRef(ref) {

        // notify all names are through to global
        let current = this;

        do {
            current.through.push(ref);
            current = current.upper;
        } while (current);
    }

    __globalCloseRef(ref) {

        // let/const/class declarations should be resolved statically.
        // others should be resolved dynamically.
        if (this.__shouldStaticallyCloseForGlobal(ref)) {
            this.__staticCloseRef(ref);
        } else {
            this.__dynamicCloseRef(ref);
        }
    }

    __close(scopeManager) {
        let closeRef;

        if (this.__shouldStaticallyClose(scopeManager)) {
            closeRef = this.__staticCloseRef;
        } else if (this.type !== "global") {
            closeRef = this.__dynamicCloseRef;
        } else {
            closeRef = this.__globalCloseRef;
        }

        // Try Resolving all references in this scope.
        for (let i = 0, iz = this.__left.length; i < iz; ++i) {
            const ref = this.__left[i];

            closeRef.call(this, ref);
        }
        this.__left = null;

        return this.upper;
    }

    // To override by function scopes.
    // References in default parameters isn't resolved to variables which are in their function body.
    __isValidResolution(ref, variable) { // eslint-disable-line class-methods-use-this, no-unused-vars  -- Desired as instance method with signature
        return true;
    }

    __resolve(ref) {
        const name = ref.identifier.name;

        if (!this.set.has(name)) {
            return false;
        }
        const variable = this.set.get(name);

        if (!this.__isValidResolution(ref, variable)) {
            return false;
        }
        variable.references.push(ref);
        variable.stack = variable.stack && ref.from.variableScope === this.variableScope;
        if (ref.tainted) {
            variable.tainted = true;
            this.taints.set(variable.name, true);
        }
        ref.resolved = variable;

        return true;
    }

    __delegateToUpperScope(ref) {
        if (this.upper) {
            this.upper.__left.push(ref);
        }
        this.through.push(ref);
    }

    __addDeclaredVariablesOfNode(variable, node) {
        if (node === null || node === void 0) {
            return;
        }

        let variables = this.__declaredVariables.get(node);

        if (variables === null || variables === void 0) {
            variables = [];
            this.__declaredVariables.set(node, variables);
        }
        if (!variables.includes(variable)) {
            variables.push(variable);
        }
    }

    __defineGeneric(name, set, variables, node, def) {
        let variable;

        variable = set.get(name);
        if (!variable) {
            variable = new Variable(name, this);
            set.set(name, variable);
            variables.push(variable);
        }

        if (def) {
            variable.defs.push(def);
            this.__addDeclaredVariablesOfNode(variable, def.node);
            this.__addDeclaredVariablesOfNode(variable, def.parent);
        }
        if (node) {
            variable.identifiers.push(node);
        }
    }

    __define(node, def) {
        if (node && node.type === Syntax$2.Identifier) {
            this.__defineGeneric(
                node.name,
                this.set,
                this.variables,
                node,
                def
            );
        }
    }

    __referencing(node, assign, writeExpr, maybeImplicitGlobal, partial, init) {

        // because Array element may be null
        if (!node || (node.type !== Syntax$2.Identifier && node.type !== "JSXIdentifier")) {
            return;
        }

        // Specially handle like `this`.
        if (node.name === "super") {
            return;
        }

        const ref = new Reference(node, this, assign || Reference.READ, writeExpr, maybeImplicitGlobal, !!partial, !!init);

        this.references.push(ref);
        this.__left.push(ref);
    }

    __detectEval() {
        let current = this;

        this.directCallToEvalScope = true;
        do {
            current.dynamic = true;
            current = current.upper;
        } while (current);
    }

    __detectThis() {
        this.thisFound = true;
    }

    __isClosed() {
        return this.__left === null;
    }

    /**
     * returns resolved {Reference}
     * @function Scope#resolve
     * @param {Espree.Identifier} ident identifier to be resolved.
     * @returns {Reference} reference
     */
    resolve(ident) {
        let ref, i, iz;

        assert(this.__isClosed(), "Scope should be closed.");
        assert(ident.type === Syntax$2.Identifier, "Target should be identifier.");
        for (i = 0, iz = this.references.length; i < iz; ++i) {
            ref = this.references[i];
            if (ref.identifier === ident) {
                return ref;
            }
        }
        return null;
    }

    /**
     * returns this scope is static
     * @function Scope#isStatic
     * @returns {boolean} static
     */
    isStatic() {
        return !this.dynamic;
    }

    /**
     * returns this scope has materialized arguments
     * @function Scope#isArgumentsMaterialized
     * @returns {boolean} arguemnts materialized
     */
    isArgumentsMaterialized() { // eslint-disable-line class-methods-use-this -- Desired as instance method
        return true;
    }

    /**
     * returns this scope has materialized `this` reference
     * @function Scope#isThisMaterialized
     * @returns {boolean} this materialized
     */
    isThisMaterialized() { // eslint-disable-line class-methods-use-this -- Desired as instance method
        return true;
    }

    isUsedName(name) {
        if (this.set.has(name)) {
            return true;
        }
        for (let i = 0, iz = this.through.length; i < iz; ++i) {
            if (this.through[i].identifier.name === name) {
                return true;
            }
        }
        return false;
    }
}

/**
 * Global scope.
 */
class GlobalScope extends Scope {
    constructor(scopeManager, block) {
        super(scopeManager, "global", null, block, false);
        this.implicit = {
            set: new Map(),
            variables: [],

            /**
             * List of {@link Reference}s that are left to be resolved (i.e. which
             * need to be linked to the variable they refer to).
             * @member {Reference[]} Scope#implicit#left
             */
            left: []
        };
    }

    __close(scopeManager) {
        const implicit = [];

        for (let i = 0, iz = this.__left.length; i < iz; ++i) {
            const ref = this.__left[i];

            if (ref.__maybeImplicitGlobal && !this.set.has(ref.identifier.name)) {
                implicit.push(ref.__maybeImplicitGlobal);
            }
        }

        // create an implicit global variable from assignment expression
        for (let i = 0, iz = implicit.length; i < iz; ++i) {
            const info = implicit[i];

            this.__defineImplicit(info.pattern,
                new Definition(
                    Variable.ImplicitGlobalVariable,
                    info.pattern,
                    info.node,
                    null,
                    null,
                    null
                ));

        }

        this.implicit.left = this.__left;

        return super.__close(scopeManager);
    }

    __defineImplicit(node, def) {
        if (node && node.type === Syntax$2.Identifier) {
            this.__defineGeneric(
                node.name,
                this.implicit.set,
                this.implicit.variables,
                node,
                def
            );
        }
    }
}

/**
 * Module scope.
 */
class ModuleScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "module", upperScope, block, false);
    }
}

/**
 * Function expression name scope.
 */
class FunctionExpressionNameScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "function-expression-name", upperScope, block, false);
        this.__define(block.id,
            new Definition(
                Variable.FunctionName,
                block.id,
                block,
                null,
                null,
                null
            ));
        this.functionExpressionScope = true;
    }
}

/**
 * Catch scope.
 */
class CatchScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "catch", upperScope, block, false);
    }
}

/**
 * With statement scope.
 */
class WithScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "with", upperScope, block, false);
    }

    __close(scopeManager) {
        if (this.__shouldStaticallyClose(scopeManager)) {
            return super.__close(scopeManager);
        }

        for (let i = 0, iz = this.__left.length; i < iz; ++i) {
            const ref = this.__left[i];

            ref.tainted = true;
            this.__delegateToUpperScope(ref);
        }
        this.__left = null;

        return this.upper;
    }
}

/**
 * Block scope.
 */
class BlockScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "block", upperScope, block, false);
    }
}

/**
 * Switch scope.
 */
class SwitchScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "switch", upperScope, block, false);
    }
}

/**
 * Function scope.
 */
class FunctionScope extends Scope {
    constructor(scopeManager, upperScope, block, isMethodDefinition) {
        super(scopeManager, "function", upperScope, block, isMethodDefinition);

        // section 9.2.13, FunctionDeclarationInstantiation.
        // NOTE Arrow functions never have an arguments objects.
        if (this.block.type !== Syntax$2.ArrowFunctionExpression) {
            this.__defineArguments();
        }
    }

    isArgumentsMaterialized() {

        // TODO(Constellation)
        // We can more aggressive on this condition like this.
        //
        // function t() {
        //     // arguments of t is always hidden.
        //     function arguments() {
        //     }
        // }
        if (this.block.type === Syntax$2.ArrowFunctionExpression) {
            return false;
        }

        if (!this.isStatic()) {
            return true;
        }

        const variable = this.set.get("arguments");

        assert(variable, "Always have arguments variable.");
        return variable.tainted || variable.references.length !== 0;
    }

    isThisMaterialized() {
        if (!this.isStatic()) {
            return true;
        }
        return this.thisFound;
    }

    __defineArguments() {
        this.__defineGeneric(
            "arguments",
            this.set,
            this.variables,
            null,
            null
        );
        this.taints.set("arguments", true);
    }

    // References in default parameters isn't resolved to variables which are in their function body.
    //     const x = 1
    //     function f(a = x) { // This `x` is resolved to the `x` in the outer scope.
    //         const x = 2
    //         console.log(a)
    //     }
    __isValidResolution(ref, variable) {

        // If `options.nodejsScope` is true, `this.block` becomes a Program node.
        if (this.block.type === "Program") {
            return true;
        }

        const bodyStart = this.block.body.range[0];

        // It's invalid resolution in the following case:
        return !(
            variable.scope === this &&
            ref.identifier.range[0] < bodyStart && // the reference is in the parameter part.
            variable.defs.every(d => d.name.range[0] >= bodyStart) // the variable is in the body.
        );
    }
}

/**
 * Scope of for, for-in, and for-of statements.
 */
class ForScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "for", upperScope, block, false);
    }
}

/**
 * Class scope.
 */
class ClassScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "class", upperScope, block, false);
    }
}

/**
 * Class field initializer scope.
 */
class ClassFieldInitializerScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "class-field-initializer", upperScope, block, true);
    }
}

/**
 * Class static block scope.
 */
class ClassStaticBlockScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "class-static-block", upperScope, block, true);
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

/**
 * @constructor ScopeManager
 */
class ScopeManager {
    constructor(options) {
        this.scopes = [];
        this.globalScope = null;
        this.__nodeToScope = new WeakMap();
        this.__currentScope = null;
        this.__options = options;
        this.__declaredVariables = new WeakMap();
    }

    __isOptimistic() {
        return this.__options.optimistic;
    }

    __ignoreEval() {
        return this.__options.ignoreEval;
    }

    __isJSXEnabled() {
        return this.__options.jsx === true;
    }

    isGlobalReturn() {
        return this.__options.nodejsScope || this.__options.sourceType === "commonjs";
    }

    isModule() {
        return this.__options.sourceType === "module";
    }

    isImpliedStrict() {
        return this.__options.impliedStrict;
    }

    isStrictModeSupported() {
        return this.__options.ecmaVersion >= 5;
    }

    // Returns appropriate scope for this node.
    __get(node) {
        return this.__nodeToScope.get(node);
    }

    /**
     * Get variables that are declared by the node.
     *
     * "are declared by the node" means the node is same as `Variable.defs[].node` or `Variable.defs[].parent`.
     * If the node declares nothing, this method returns an empty array.
     * CAUTION: This API is experimental. See https://github.com/estools/escope/pull/69 for more details.
     * @param {Espree.Node} node a node to get.
     * @returns {Variable[]} variables that declared by the node.
     */
    getDeclaredVariables(node) {
        return this.__declaredVariables.get(node) || [];
    }

    /**
     * acquire scope from node.
     * @function ScopeManager#acquire
     * @param {Espree.Node} node node for the acquired scope.
     * @param {?boolean} [inner=false] look up the most inner scope, default value is false.
     * @returns {Scope?} Scope from node
     */
    acquire(node, inner) {

        /**
         * predicate
         * @param {Scope} testScope scope to test
         * @returns {boolean} predicate
         */
        function predicate(testScope) {
            if (testScope.type === "function" && testScope.functionExpressionScope) {
                return false;
            }
            return true;
        }

        const scopes = this.__get(node);

        if (!scopes || scopes.length === 0) {
            return null;
        }

        // Heuristic selection from all scopes.
        // If you would like to get all scopes, please use ScopeManager#acquireAll.
        if (scopes.length === 1) {
            return scopes[0];
        }

        if (inner) {
            for (let i = scopes.length - 1; i >= 0; --i) {
                const scope = scopes[i];

                if (predicate(scope)) {
                    return scope;
                }
            }
        } else {
            for (let i = 0, iz = scopes.length; i < iz; ++i) {
                const scope = scopes[i];

                if (predicate(scope)) {
                    return scope;
                }
            }
        }

        return null;
    }

    /**
     * acquire all scopes from node.
     * @function ScopeManager#acquireAll
     * @param {Espree.Node} node node for the acquired scope.
     * @returns {Scopes?} Scope array
     */
    acquireAll(node) {
        return this.__get(node);
    }

    /**
     * release the node.
     * @function ScopeManager#release
     * @param {Espree.Node} node releasing node.
     * @param {?boolean} [inner=false] look up the most inner scope, default value is false.
     * @returns {Scope?} upper scope for the node.
     */
    release(node, inner) {
        const scopes = this.__get(node);

        if (scopes && scopes.length) {
            const scope = scopes[0].upper;

            if (!scope) {
                return null;
            }
            return this.acquire(scope.block, inner);
        }
        return null;
    }

    attach() { } // eslint-disable-line class-methods-use-this -- Desired as instance method

    detach() { } // eslint-disable-line class-methods-use-this -- Desired as instance method

    __nestScope(scope) {
        if (scope instanceof GlobalScope) {
            assert(this.__currentScope === null);
            this.globalScope = scope;
        }
        this.__currentScope = scope;
        return scope;
    }

    __nestGlobalScope(node) {
        return this.__nestScope(new GlobalScope(this, node));
    }

    __nestBlockScope(node) {
        return this.__nestScope(new BlockScope(this, this.__currentScope, node));
    }

    __nestFunctionScope(node, isMethodDefinition) {
        return this.__nestScope(new FunctionScope(this, this.__currentScope, node, isMethodDefinition));
    }

    __nestForScope(node) {
        return this.__nestScope(new ForScope(this, this.__currentScope, node));
    }

    __nestCatchScope(node) {
        return this.__nestScope(new CatchScope(this, this.__currentScope, node));
    }

    __nestWithScope(node) {
        return this.__nestScope(new WithScope(this, this.__currentScope, node));
    }

    __nestClassScope(node) {
        return this.__nestScope(new ClassScope(this, this.__currentScope, node));
    }

    __nestClassFieldInitializerScope(node) {
        return this.__nestScope(new ClassFieldInitializerScope(this, this.__currentScope, node));
    }

    __nestClassStaticBlockScope(node) {
        return this.__nestScope(new ClassStaticBlockScope(this, this.__currentScope, node));
    }

    __nestSwitchScope(node) {
        return this.__nestScope(new SwitchScope(this, this.__currentScope, node));
    }

    __nestModuleScope(node) {
        return this.__nestScope(new ModuleScope(this, this.__currentScope, node));
    }

    __nestFunctionExpressionNameScope(node) {
        return this.__nestScope(new FunctionExpressionNameScope(this, this.__currentScope, node));
    }

    __isES6() {
        return this.__options.ecmaVersion >= 6;
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

const { Syntax: Syntax$1 } = estraverse__default["default"];

/**
 * Get last arr