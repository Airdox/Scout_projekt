rgument);
    }

    ArrayExpression(node) {
        node.elements.forEach(this.visit, this);
    }

    AssignmentExpression(node) {
        this.assignments.push(node);
        this.visit(node.left);
        this.rightHandNodes.push(node.right);
        this.assignments.pop