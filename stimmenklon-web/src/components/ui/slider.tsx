  }
}

/**
 * Referencing variables and creating bindings.
 */
class Referencer extends esrecurse__default["default"].Visitor {
    constructor(options, scopeManager) {
        super(null, options);
        this.options = options;
        this.scopeManager = scopeManager;
        this.parent = null;
        this.isInnerMethodDefinition = false;
    }

    currentScope() {
        return this.scopeManager.__currentScope;
    }

    close(node) {
        while (this.currentScope() && node === this.currentScope().block) {
            this.scopeManager.__currentScope = this.currentScope().__close(this.scopeManager);
        }
    }

    pushInnerMethodDefinition(isInnerMethodDefinition) {
        const previous = this.isInnerMethodDefinition;

        this.isInnerMethodDefinition = isInnerMethodDefinition;
        return previous;
    }

    popInnerMethodDefinition(isInnerMethodDefinition) {
        this.isInnerMethodDefinition = isInnerMethodDefinition;
    }

    referencingDefaultValue(pattern, assignments, maybeImplicitGlobal, init) {
        const scope = this.currentScope();

        assignments.forEach(assignment => {
            scope.__referencing(
                pattern,
                Reference.WRITE,
                assignment.right,
                maybeImplicitGlobal,
                pattern !== assignment.left,
                init
            );
        });
    }

    visitPattern(node, options, callback) {
        let visitPatternOptions = options;
        let visitPatternCallback = callback;

        if (typeof options === "function") {
            visitPatternCallback = options;
            visitPatternOptions = { processRightHandNodes: false };
        }

        traverseIdentifierInPattern(
            this.options,
            node,
            visitPatternOptions.processRightHandNodes ? this : null,
            visitPatternCallback
        );
    }

    visitFunction(node) {
        let i, iz;

        // FunctionDeclaration name is defined in u