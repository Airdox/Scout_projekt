     // so check it exists before traversing
        if (node.body) {

            // Skip BlockStatement to prevent creating BlockStatement scope.
            if (node.body.type === Syntax.BlockStatement) {
                this.visitChildren(node.body);
            } else {
                this.visit(node.body);
            }
        }

        this.close(node);
    }

    visitClass(node) {
        if (node.type === Syntax.ClassDeclaration) {
            this.currentScope().__define(node.id,
                new Definition(
                    Variable.ClassName,
                    node.id,
                    node,
                    null,
                    null,
                    null
                ));
        }

        this.scopeManager.__nestClassScope(node);

     