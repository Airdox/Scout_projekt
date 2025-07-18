Name = nameNode.type === "JSXIdentifier" && nameNode.name[0].toUpperCase() === nameNode.name[0];
            const isComponent = isComponentName || nameNode.type === "JSXMemberExpression";

            // we only want to visit JSXIdentifier nodes if they are capitalized
            if (isComponent) {
                this.visit(nameNode);
            }
        }

        node.attributes.forEach(this.visit, this);
    }

    JSXAttribute(node) {
        if (node.value) {
            this.visit(node.value);
        }
    }

    JSXExpressionContainer(node) {
        this.visit(node.expression);
    }

    JSXNamespacedName(node) {
        this.visit(node.namespace);
        this.visit(node.name);
    }
}

/* vim: set sw=4 ts=4 et tw=80 : */

const version = "8.3.0";

/*
  Copyright (C) 2012-2014 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2013 Alex Seville <hi@alexanderseville.com>
  Copyright (C) 2014 Thiago de Arruda <tpadilha84@gmail.com>

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
  LOSS OF USE, DATA, OR PROFITS; OR BU