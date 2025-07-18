                 });
                        }
                        else if ((0, util_1.isTypeAnyArrayType)(spreadArgType, checker)) {
                            // foo(...any[])
                            // TODO - we could break down the spread and compare the array type against each argument
                            context.report({
                                node: argument,
                                messageId: 'unsafeArraySpread',
                                data: { sender: describeTypeForSpread(spreadArgType) },
                            });
                        }
                        else if (checker.isTupleType(spreadArgType)) {
                            // foo(...[tuple1, tuple2])
                            const spreadTypeArguments = checker.getTypeArguments(spreadArgType);
                            for (const tupleType of spreadTypeArguments) {
                                const parameterType = signature.getNextParameterType();
                                if (parameterType == null) {
                                    continue;
                                }
                                const result = (0, util_1.isUnsafeAssignment)(tupleType, parameterType, checker, 
                                // we can't pass the individual tuple members in here as this will most likely be a spread variable
                                // not a spread array
                                null);
                                if (result) {
                                    context.report({
                                        node: argument,
                                        messageId: 'unsafeTupleSpread',
                                        data: {
                                            receiver: describeType(parameterType),
                                            sender: describeTypeForTuple(tupleType),
                                        },
                                    });
                                }
                            }
                            if (spreadArgType.target.combinedFlags & ts.ElementFlags.Variable) {
                                // the last element was a rest - so all remaining defined arguments can be considered "consumed"
                                // all remaining arguments should be compared against the rest type (if one exists)
                                signature.consumeRemainingArguments();
                            }
                        }
                        else {
                            // something that's iterable
                            // handling this will be pretty complex - so we ignore it for now
                            // TODO - handle generic iterable case
                        }
                        break;
                    }
                    default: {
                        const parameterType = signature.getNextParameterType();
                        if (parameterType == null) {
                            continue;
                        }
                        const argumentType = services.getTypeAtLocation(argument);
                        const result = (0, util_1.isUnsafeAssignment)(argumentType, parameterType, checker, argument);
                        if (result) {
                            context.report({
                                node: argument,
                                messageId: 'unsafeArgument',
                                data: {
                                    receiver: describeType(parameterType),
                                    sender: describeType(argumentType),
                                },
                            });
                        }
                    }
                }
            }
        }
        return {
            'CallExpression, NewExpression'(node) {
                checkUnsafeArguments(node.arguments, node.callee, node);
            },
            TaggedTemplateExpression(node) {
                checkUnsafeArguments(node.quasi.expressions, node.tag, node);
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const tsutils = __importStar(require("ts-api-utils"));
const util_1 = require("../util");
var ComparisonType;
(function (ComparisonType) {
    /** Do no assignment comparison */
    ComparisonType[ComparisonType["None"] = 0] = "None";
    /** Use the receiver's type for comparison */
    ComparisonType[ComparisonType["Basic"] = 1] = "Basic";
    /** Use the sender's contextual type for comparison */
    ComparisonType[ComparisonType["Contextual"] = 2] = "Contextual";
})(ComparisonType || (ComparisonType = {}));
exports.default = (0, util_1.createRule)({
    name: 'no-unsafe-assignment',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow assigning a value with type `any` to variables and properties',
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        messages: {
            anyAssignment: 'Unsafe assignment of an {{sender}} value.',
            anyAssignmentThis: [
                'Unsafe assignment of an {{sender}} value. `this` is typed as `any`.',
                'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
            ].join('\n'),
            unsafeArrayPattern: 'Unsafe array destructuring of an {{sender}} array value.',
            unsafeArrayPatternFromTuple: 'Unsafe array destructuring of a tuple element with an {{sender}} value.',
            unsafeArraySpread: 'Unsafe spread of an {{sender}} value in an array.',
            unsafeAssignment: 'Unsafe assignment of type {{sender}} to a variable of type {{receiver}}.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const services = (0, util_1.getParserServices)(context);
        const checker = services.program.getTypeChecker();
        const compilerOptions = services.program.getCompilerOptions();
        const isNoImplicitThis = tsutils.isStrictCompilerOptionEnabled(compilerOptions, 'noImplicitThis');
        // returns true if the assignment reported
        function checkArrayDestructureHelper(receiverNode, senderNode) {
            if (receiverNode.type !== utils_1.AST_NODE_TYPES.ArrayPattern) {
                return false;
            }
            const senderTsNode = services.esTreeNodeToTSNodeMap.get(senderNode);
            const senderType = services.getTypeAtLocation(senderNode);
            return checkArrayDestructure(receiverNode, senderType, senderTsNode);
        }
        // returns true if the assignment reported
        function checkArrayDestructure(receiverNode, senderType, senderNode) {
            // any array
            // const [x] = ([] as any[]);
            if ((0, util_1.isTypeAnyArrayType)(senderType, checker)) {
                context.report({
                    node: receiverNode,
                    messageId: 'unsafeArrayPattern',
                    data: createData(senderType),
                });
                return false;
            }
            if (!checker.isTupleType(senderType)) {
                return true;
            }
            const tupleElements = checker.getTypeArguments(senderType);
            // tuple with any
            // const [x] = [1 as any];
            let didReport = false;
            for (let receiverIndex = 0; receiverIndex < receiverNode.elements.length; receiverIndex += 1) {
                const receiverElement = receiverNode.elements[receiverIndex];
                if (!receiverElement) {
                    continue;
                }
                if (receiverElement.type === utils_1.AST_NODE_TYPES.RestElement) {
                    // don't handle rests as they're not a 1:1 assignment
                    continue;
                }
                const senderType = tupleElements[receiverIndex];
                if (!senderType) {
                    continue;
                }
                // check for the any type first so we can handle [[[x]]] = [any]
                if ((0, util_1.isTypeAnyType)(senderType)) {
                    context.report({
                        node: receiverElement,
                        messageId: 'unsafeArrayPatternFromTuple',
                        data: createData(senderType),
                    });
                    // we want to report on every invalid element in the tuple
                    didReport = true;
                }
                else if (receiverElement.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
                    didReport = checkArrayDestructure(receiverElement, senderType, senderNode);
                }
                else if (receiverElement.type === utils_1.AST_NODE_TYPES.ObjectPattern) {
                    didReport = checkObjectDestructure(receiverElement, senderType, senderNode);
                }
            }
            return didReport;
        }
        // returns true if the assignment reported
        function checkObjectDestructureHelper(receiverNode, senderNode) {
            if (receiverNode.type !== utils_1.AST_NODE_TYPES.ObjectPattern) {
                return false;
            }
            const senderTsNode = services.esTreeNodeToTSNodeMap.get(senderNode);
            const senderType = services.getTypeAtLocation(senderNode);
            return checkObjectDestructure(receiverNode, senderType, senderTsNode);
        }
        // returns true if the assignment reported
        function checkObjectDestructure(receiverNode, senderType, senderNode) {
            const properties = new Map(senderType
                .getProperties()
                .map(property => [
                property.getName(),
                checker.getTypeOfSymbolAtLocation(property, senderNode),
            ]));
            let didReport = false;
            for (const receiverProperty of receiverNode.properties) {
                if (receiverProperty.type === utils_1.AST_NODE_TYPES.RestElement) {
                    // don't bother checking rest
                    continue;
                }
                let key;
                if (!receiverProperty.computed) {
                    key =
                        receiverProperty.key.type === utils_1.AST_NODE_TYPES.Identifier
                            ? receiverProperty.key.name
                            : String(receiverProperty.key.value);
                }
                else if (receiverProperty.key.type === utils_1.AST_NODE_TYPES.Literal) {
                    key = String(receiverProperty.key.value);
                }
                else if (receiverProperty.key.type === utils_1.AST_NODE_TYPES.TemplateLiteral &&
                    receiverProperty.key.quasis.length === 1) {
                    key = receiverProperty.key.quasis[0].value.cooked;
                }
                else {
                    // can't figure out the name, so skip it
                    continue;
                }
                const senderType = properties.get(key);
                if (!senderType) {
                    continue;
                }
                // check for the any type first so we can handle {x: {y: z}} = {x: any}
                if ((0, util_1.isTypeAnyType)(senderType)) {
                    context.report({
                        node: receiverProperty.value,
                        messageId: 'unsafeArrayPatternFromTuple',
                        data: createData(senderType),
                    });
                    didReport = true;
                }
                else if (receiverProperty.value.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
                    didReport = checkArrayDestructure(receiverProperty.value, senderType, senderNode);
                }
                else if (receiverProperty.value.type === utils_1.AST_NODE_TYPES.ObjectPattern) {
                    didReport = checkObjectDestructure(receiverProperty.value, senderType, senderNode);
                }
            }
            return didReport;
        }
        // returns true if the assignment reported
        function checkAssignment(receiverNode, senderNode, reportingNode, comparisonType) {
            const receiverTsNode = services.esTreeNodeToTSNodeMap.get(receiverNode);
            const receiverType = comparisonType === ComparisonType.Contextual
                ? ((0, util_1.getContextualType)(checker, receiverTsNode) ??
                    services.getTypeAtLocation(receiverNode))
                : services.getTypeAtLocation(receiverNode);
            const senderType = services.getTypeAtLocation(senderNode);
            if ((0, util_1.isTypeAnyType)(senderType)) {
                // handle cases when we assign any ==> unknown.
                if ((0, util_1.isTypeUnknownType)(receiverType)) {
                    return false;
                }
                let messageId = 'anyAssignment';
                if (!isNoImplicitThis) {
                    // `var foo = this`
                    const thisExpression = (0, util_1.getThisExpression)(senderNode);
                    if (thisExpression &&
                        (0, util_1.isTypeAnyType)((0, util_1.getConstrainedTypeAtLocation)(services, thisExpression))) {
                        messageId = 'anyAssignmentThis';
                    }
                }
                context.report({
                    node: reportingNode,
                    messageId,
                    data: createData(senderType),
                });
                return true;
            }
            if (comparisonType === ComparisonType.None) {
                return false;
            }
            const result = (0, util_1.isUnsafeAssignment)(senderType, receiverType, checker, senderNode);
            if (!result) {
                return false;
            }
            const { receiver, sender } = result;
            context.report({
                node: reportingNode,
                messageId: 'unsafeAssignment',
                data: createData(sender, receiver),
            });
            return true;
        }
        function getComparisonType(typeAnnotation) {
            return typeAnnotation
                ? // if there's a type annotation, we can do a comparison
                    ComparisonType.Basic
                : // no type annotation means the variable's type will just be inferred, thus equal
                    ComparisonType.None;
        }
        function createData(senderType, receiverType) {
            if (receiverType) {
                return {
                    receiver: `\`${checker.typeToString(receiverType)}\``,
                    sender: `\`${checker.typeToString(senderType)}\``,
                };
            }
            return {
                sender: tsutils.isIntrinsicErrorType(senderType)
                    ? 'error typed'
                    : '`any`',
            };
        }
        return {
            'AccessorProperty[value != null]'(node) {
                checkAssignment(node.key, node.value, node, getComparisonType(node.typeAnnotation));
            },
            'AssignmentExpression[operator = "="], AssignmentPattern'(node) {
                let didReport = checkAssignment(node.left, node.right, node, 
                // the variable already has some form of a type to compare against
                ComparisonType.Basic);
                if (!didReport) {
                    didReport = checkArrayDestructureHelper(node.left, node.right);
                }
                if (!didReport) {
                    checkObjectDestructureHelper(node.left, node.right);
                }
            },
            'PropertyDefinition[value != null]'(node) {
                checkAssignment(node.key, node.value, node, getComparisonType(node.typeAnnotation));
            },
            'VariableDeclarator[init != null]'(node) {
                const init = (0, util_1.nullThrows)(node.init, util_1.NullThrowsReasons.MissingToken(node.type, 'init'));
                let didReport = checkAssignment(node.id, init, node, getComparisonType(node.id.typeAnnotation));
                if (!didReport) {
                    didReport = checkArrayDestructureHelper(node.id, init);
                }
                if (!didReport) {
                    checkObjectDestructureHelper(node.id, init);
                }
            },
            // object pattern props are checked via assignments
            ':not(ObjectPattern) > Property'(node) {
                if (node.value.type === utils_1.AST_NODE_TYPES.AssignmentPattern ||
                    node.value.type === utils_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression) {
                    // handled by other selector
                    return;
                }
                checkAssignment(node.key, node.value, node, ComparisonType.Contextual);
            },
            'ArrayExpression > SpreadElement'(node) {
                const restType = services.getTypeAtLocation(node.argument);
                if ((0, util_1.isTypeAnyType)(restType) || (0, util_1.isTypeAnyArrayType)(restType, checker)) {
                    context.report({
                        node,
                        messageId: 'unsafeArraySpread',
                        data: createData(restType),
                    });
                }
            },
            'JSXAttribute[value != null]'(node) {
                const value = (0, util_1.nullThrows)(node.value, util_1.NullThrowsReasons.MissingToken(node.type, 'value'));
                if (value.type !== utils_1.AST_NODE_TYPES.JSXExpressionContainer ||
                    value.expression.type === utils_1.AST_NODE_TYPES.JSXEmptyExpression) {
                    return;
                }
                checkAssignment(node.name, value.expression, value.expression, ComparisonType.Contextual);
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
const shared_1 = require("./enum-utils/shared");
/**
 * @returns Whether the right type is an unsafe comparison against any left type.
 */
function typeViolates(leftTypeParts, rightType) {
    const leftEnumValueTypes = new Set(leftTypeParts.map(getEnumValueType));
    return ((leftEnumValueTypes.has(ts.TypeFlags.Number) && isNumberLike(rightType)) ||
        (leftEnumValueTypes.has(ts.TypeFlags.String) && isStringLike(rightType)));
}
function isNumberLike(type) {
    const typeParts = tsutils.intersectionConstituents(type);
    return typeParts.some(typePart => {
        return tsutils.isTypeFlagSet(typePart, ts.TypeFlags.Number | ts.TypeFlags.NumberLike);
    });
}
function isStringLike(type) {
    const typeParts = tsutils.intersectionConstituents(type);
    return typeParts.some(typePart => {
        return tsutils.isTypeFlagSet(typePart, ts.TypeFlags.String | ts.TypeFlags.StringLike);
    });
}
/**
 * @returns What type a type's enum value is (number or string), if either.
 */
function getEnumValueType(type) {
    return tsutils.isTypeFlagSet(type, ts.TypeFlags.EnumLike)
        ? tsutils.isTypeFlagSet(type, ts.TypeFlags.NumberLiteral)
            ? ts.TypeFlags.Number
            : ts.TypeFlags.String
        : undefined;
}
exports.default = (0, util_1.createRule)({
    name: 'no-unsafe-enum-comparison',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow comparing an enum value with a non-enum value',
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        hasSuggestions: true,
        messages: {
            mismatchedCase: 'The case statement does not have a shared enum type with the switch predicate.',
            mismatchedCondition: 'The two values in this comparison do not have a shared enum type.',
            replaceValueWithEnum: 'Replace with an enum value comparison.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const parserServices = (0, util_1.getParserServices)(context);
        const typeChecker = parserServices.program.getTypeChecker();
        function isMismatchedComparison(leftType, rightType) {
            // Allow comparisons that don't have anything to do with enums:
            //
            // ```ts
            // 1 === 2;
            // ```
            const leftEnumTypes = (0, shared_1.getEnumTypes)(typeChecker, leftType);
            const rightEnumTypes = new Set((0, shared_1.getEnumTypes)(typeChecker, rightType));
            if (leftEnumTypes.length === 0 && rightEnumTypes.size === 0) {
                return false;
            }
            // Allow comparisons that share an enum type:
            //
            // ```ts
            // Fruit.Apple === Fruit.Banana;
            // ```
            for (const leftEnumType of leftEnumTypes) {
                if (rightEnumTypes.has(leftEnumType)) {
                    return false;
                }
            }
            // We need to split the type into the union type parts in order to find
            // valid enum comparisons like:
            //
            // ```ts
            // declare const something: Fruit | Vegetable;
            // something === Fruit.Apple;
            // ```
            const leftTypeParts = tsutils.unionConstituents(leftType);
            const rightTypeParts = tsutils.unionConstituents(rightType);
            // If a type exists in both sides, we consider this comparison safe:
            //
            // ```ts
            // declare const fruit: Fruit.Apple | 0;
            // fruit === 0;
            // ```
            for (const leftTypePart of leftTypeParts) {
                if (rightTypeParts.includes(leftTypePart)) {
                    return false;
                }
            }
            return (typeViolates(leftTypeParts, rightType) ||
                typeViolates(rightTypeParts, leftType));
        }
        return {
            'BinaryExpression[operator=/^[<>!=]?={0,2}$/]'(node) {
                const leftType = parserServices.getTypeAtLocation(node.left);
                const rightType = parserServices.getTypeAtLocation(node.right);
                if (isMismatchedComparison(leftType, rightType)) {
                    context.report({
                        node,
                        messageId: 'mismatchedCondition',
                        suggest: [
                            {
                                messageId: 'replaceValueWithEnum',
                                fix(fixer) {
                                    // Replace the right side with an enum key if possible:
                                    //
                                    // ```ts
                                    // Fruit.Apple === 'apple'; // Fruit.Apple === Fruit.Apple
                                    // ```
                                    const leftEnumKey = (0, shared_1.getEnumKeyForLiteral)((0, shared_1.getEnumLiterals)(leftType), (0, util_1.getStaticValue)(node.right)?.value);
                                    if (leftEnumKey) {
                                        return fixer.replaceText(node.right, leftEnumKey);
                                    }
                                    // Replace the left side with an enum key if possible:
                                    //
                                    // ```ts
                                    // declare const fruit: Fruit;
                                    // 'apple' === Fruit.Apple; // Fruit.Apple === Fruit.Apple
                                    // ```
                                    const rightEnumKey = (0, shared_1.getEnumKeyForLiteral)((0, shared_1.getEnumLiterals)(rightType), (0, util_1.getStaticValue)(node.left)?.value);
                                    if (rightEnumKey) {
                                        return fixer.replaceText(node.left, rightEnumKey);
                                    }
                                    return null;
                                },
                            },
                        ],
                    });
                }
            },
            SwitchCase(node) {
                // Ignore `default` cases.
                if (node.test == null) {
                    return;
                }
                const { parent } = node;
                const leftType = parserServices.getTypeAtLocation(parent.discriminant);
                const rightType = parserServices.getTypeAtLocation(node.test);
                if (isMismatchedComparison(leftType, rightType)) {
                    context.report({
                        node,
                        messageId: 'mismatchedCase',
                    });
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const util = __importStar(require("../util"));
exports.default = util.createRule({
    name: 'no-unsafe-unary-minus',
    meta: {
        type: 'problem',
        docs: {
            description: 'Require unary negation to take a number',
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        messages: {
            unaryMinus: 'Argument of unary negation should be assignable to number | bigint but is {{type}} instead.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        return {
            UnaryExpression(node) {
                if (node.operator !== '-') {
                    return;
                }
                const services = util.getParserServices(context);
                const argType = util.getConstrainedTypeAtLocation(services, node.argument);
                const checker = services.program.getTypeChecker();
                if (tsutils
                    .unionConstituents(argType)
                    .some(type => !tsutils.isTypeFlagSet(type, ts.TypeFlags.Any |
                    ts.TypeFlags.Never |
                    ts.TypeFlags.BigIntLike |
                    ts.TypeFlags.NumberLike))) {
                    context.report({
                        node,
                        messageId: 'unaryMinus',
                        data: { type: checker.typeToString(argType) },
                    });
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const tsutils = __importStar(require("ts-api-utils"));
const util_1 = require("../util");
var State;
(function (State) {
    State[State["Unsafe"] = 1] = "Unsafe";
    State[State["Safe"] = 2] = "Safe";
})(State || (State = {}));
function createDataType(type) {
    const isErrorType = tsutils.isIntrinsicErrorType(type);
    return isErrorType ? '`error` typed' : '`any`';
}
exports.default = (0, util_1.createRule)({
    name: 'no-unsafe-member-access',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow member access on a value with type `any`',
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        messages: {
            unsafeComputedMemberAccess: 'Computed name {{property}} resolves to an {{type}} value.',
            unsafeMemberExpression: 'Unsafe member access {{property}} on an {{type}} value.',
            unsafeThisMemberExpression: [
                'Unsafe member access {{property}} on an `any` value. `this` is typed as `any`.',
                'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
            ].join('\n'),
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const services = (0, util_1.getParserServices)(context);
        const compilerOptions = services.program.getCompilerOptions();
        const isNoImplicitThis = tsutils.isStrictCompilerOptionEnabled(compilerOptions, 'noImplicitThis');
        const stateCache = new Map();
        function checkMemberExpression(node) {
            const cachedState = stateCache.get(node);
            if (cachedState) {
                return cachedState;
            }
            if (node.object.type === utils_1.AST_NODE_TYPES.MemberExpression) {
                const objectState = checkMemberExpression(node.object);
                if (objectState === State.Unsafe) {
                    // if the object is unsafe, we know this will be unsafe as well
                    // we don't need to report, as we have already reported on the inner member expr
                    stateCache.set(node, objectState);
                    return objectState;
                }
            }
            const type = services.getTypeAtLocation(node.object);
            const state = (0, util_1.isTypeAnyType)(type) ? State.Unsafe : State.Safe;
            stateCache.set(node, state);
            if (state === State.Unsafe) {
                const propertyName = context.sourceCode.getText(node.property);
                let messageId = 'unsafeMemberExpression';
                if (!isNoImplicitThis) {
                    // `this.foo` or `this.foo[bar]`
                    const thisExpression = (0, util_1.getThisExpression)(node);
                    if (thisExpression &&
                        (0, util_1.isTypeAnyType)((0, util_1.getConstrainedTypeAtLocation)(services, thisExpression))) {
                        messageId = 'unsafeThisMemberExpression';
                    }
                }
                context.report({
                    node: node.property,
                    messageId,
                    data: {
                        type: createDataType(type),
                        property: node.computed ? `[${propertyName}]` : `.${propertyName}`,
                    },
                });
            }
            return state;
        }
        return {
            // ignore MemberExpressions with ancestors of type `TSClassImplements` or `TSInterfaceHeritage`
            'MemberExpression:not(TSClassImplements MemberExpression, TSInterfaceHeritage MemberExpression)': checkMemberExpression,
            'MemberExpression[computed = true] > *.property'(node) {
                if (
                // x[1]
                node.type === utils_1.AST_NODE_TYPES.Literal ||
                    // x[1++] x[++x] etc
                    // FUN FACT - **all** update expressions return type number, regardless of the argument's type,
                    // because JS engines return NaN if there the argument is not a number.
                    node.type === utils_1.AST_NODE_TYPES.UpdateExpression) {
                    // perf optimizations - literals can obviously never be `any`
                    return;
                }
                const type = services.getTypeAtLocation(node);
                if ((0, util_1.isTypeAnyType)(type)) {
                    const propertyName = context.sourceCode.getText(node);
                    context.report({
                        node,
                        messageId: 'unsafeComputedMemberAccess',
                        data: {
                            type: createDataType(type),
                            property: `[${propertyName}]`,
                        },
                    });
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
const getParentFunctionNode_1 = require("../util/getParentFunctionNode");
exports.default = (0, util_1.createRule)({
    name: 'no-unsafe-return',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow returning a value with type `any` from a function',
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        messages: {
            unsafeReturn: 'Unsafe return of a value of type {{type}}.',
            unsafeReturnAssignment: 'Unsafe return of type `{{sender}}` from function with return type `{{receiver}}`.',
            unsafeReturnThis: [
                'Unsafe return of a value of type `{{type}}`. `this` is typed as `any`.',
                'You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.',
            ].join('\n'),
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const services = (0, util_1.getParserServices)(context);
        const checker = services.program.getTypeChecker();
        const compilerOptions = services.program.getCompilerOptions();
        const isNoImplicitThis = tsutils.isStrictCompilerOptionEnabled(compilerOptions, 'noImplicitThis');
        function checkReturn(returnNode, reportingNode = returnNode) {
            const tsNode = services.esTreeNodeToTSNodeMap.get(returnNode);
            const type = checker.getTypeAtLocation(tsNode);
            const anyType = (0, util_1.discriminateAnyType)(type, checker, services.program, tsNode);
            const functionNode = (0, getParentFunctionNode_1.getParentFunctionNode)(returnNode);
            /* istanbul ignore if */ if (!functionNode) {
                return;
            }
            // function has an explicit return type, so ensure it's a safe return
            const returnNodeType = (0, util_1.getConstrainedTypeAtLocation)(services, returnNode);
            const functionTSNode = services.esTreeNodeToTSNodeMap.get(functionNode);
            // function expressions will not have their return type modified based on receiver typing
            // so we have to use the contextual typing in these cases, i.e.
            // const foo1: () => Set<string> = () => new Set<any>();
            // the return type of the arrow function is Set<any> even though the variable is typed as Set<string>
            let functionType = ts.isFunctionExpression(functionTSNode) ||
                ts.isArrowFunction(functionTSNode)
                ? (0, util_1.getContextualType)(checker, functionTSNode)
                : services.getTypeAtLocation(functionNode);
            functionType ??= services.getTypeAtLocation(functionNode);
            const callSignatures = tsutils.getCallSignaturesOfType(functionType);
            // If there is an explicit type annotation *and* that type matches the actual
            // function return type, we shouldn't complain (it's intentional, even if unsafe)
            if (functionTSNode.type) {
                for (const signature of callSignatures) {
                    const signatureReturnType = signature.getReturnType();
                    if (returnNodeType === signatureReturnType ||
                        (0, util_1.isTypeFlagSet)(signatureReturnType, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
                        return;
                    }
                    if (functionNode.async) {
                        const awaitedSignatureReturnType = checker.getAwaitedType(signatureReturnType);
                        const awaitedReturnNodeType = checker.getAwaitedType(returnNodeType);
                        if (awaitedReturnNodeType === awaitedSignatureReturnType ||
                            (awaitedSignatureReturnType &&
                                (0, util_1.isTypeFlagSet)(awaitedSignatureReturnType, ts.TypeFlags.Any | ts.TypeFlags.Unknown))) {
                            return;
                        }
                    }
                }
            }
            if (anyType !== util_1.AnyType.Safe) {
                // Allow cases when the declared return type of the function is either unknown or unknown[]
                // and the function is returning any or any[].
                for (const signature of callSignatures) {
                    const functionReturnType = signature.getReturnType();
                    if (anyType === util_1.AnyType.Any &&
                        (0, util_1.isTypeUnknownType)(functionReturnType)) {
                        return;
                    }
                    if (anyType === util_1.AnyType.AnyArray &&
                        (0, util_1.isTypeUnknownArrayType)(functionReturnType, checker)) {
                        return;
                    }
                    const awaitedType = checker.getAwaitedType(functionReturnType);
                    if (awaitedType &&
                        anyType === util_1.AnyType.PromiseAny &&
                        (0, util_1.isTypeUnknownType)(awaitedType)) {
                        return;
                    }
                }
                if (anyType === util_1.AnyType.PromiseAny && !functionNode.async) {
                    return;
                }
                let messageId = 'unsafeReturn';
                const isErrorType = tsutils.isIntrinsicErrorType(returnNodeType);
                if (!isNoImplicitThis) {
                    // `return this`
                    const thisExpression = (0, util_1.getThisExpression)(returnNode);
                    if (thisExpression &&
                        (0, util_1.isTypeAnyType)((0, util_1.getConstrainedTypeAtLocation)(services, thisExpression))) {
                        messageId = 'unsafeReturnThis';
                    }
                }
                // If the function return type was not unknown/unknown[], mark usage as unsafeReturn.
                return context.report({
                    node: reportingNode,
                    messageId,
                    data: {
                        type: isErrorType
                            ? 'error'
                            : anyType === util_1.AnyType.Any
                                ? '`any`'
                                : anyType === util_1.AnyType.PromiseAny
                                    ? '`Promise<any>`'
                                    : '`any[]`',
                    },
                });
            }
            const signature = functionType.getCallSignatures().at(0);
            if (signature) {
                const functionReturnType = signature.getReturnType();
                const result = (0, util_1.isUnsafeAssignment)(returnNodeType, functionReturnType, checker, returnNode);
                if (!result) {
                    return;
                }
                const { receiver, sender } = result;
                return context.report({
                    node: reportingNode,
                    messageId: 'unsafeReturnAssignment',
                    data: {
                        receiver: checker.typeToString(receiver),
                        sender: checker.typeToString(sender),
                    },
                });
            }
        }
        return {
            'ArrowFunctionExpression > :not(BlockStatement).body': checkReturn,
            ReturnStatement(node) {
                const argument = node.argument;
                if (!argument) {
                    return;
                }
                checkReturn(argument, node);
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
const getESLintCoreRule_1 = require("../util/getESLintCoreRule");
const baseRule = (0, getESLintCoreRule_1.getESLintCoreRule)('no-unused-expressions');
const defaultOptions = [
    {
        allowShortCircuit: false,
        allowTaggedTemplates: false,
        allowTernary: false,
    },
];
exports.default = (0, util_1.createRule)({
    name: 'no-unused-expressions',
    meta: {
        type: 'suggestion',
        defaultOptions,
        docs: {
            description: 'Disallow unused expressions',
            extendsBaseRule: true,
            recommended: 'recommended',
        },
        hasSuggestions: baseRule.meta.hasSuggestions,
        messages: baseRule.meta.messages,
        schema: baseRule.meta.schema,
    },
    defaultOptions,
    create(context, [{ allowShortCircuit = false, allowTernary = false }]) {
        const rules = baseRule.create(context);
        function isValidExpression(node) {
            if (allowShortCircuit && node.type === utils_1.AST_NODE_TYPES.LogicalExpression) {
                return isValidExpression(node.right);
            }
            if (allowTernary && node.type === utils_1.AST_NODE_TYPES.ConditionalExpression) {
                return (isValidExpression(node.alternate) &&
                    isValidExpression(node.consequent));
            }
            return ((node.type === utils_1.AST_NODE_TYPES.ChainExpression &&
                node.expression.type === utils_1.AST_NODE_TYPES.CallExpression) ||
                node.type === utils_1.AST_NODE_TYPES.ImportExpression);
        }
        return {
            ExpressionStatement(node) {
                if (node.directive || isValidExpression(node.expression)) {
                    return;
                }
                const expressionType = node.expression.type;
                if (expressionType ===
                    utils_1.TSESTree.AST_NODE_TYPES.TSInstantiationExpression ||
                    expressionType === utils_1.TSESTree.AST_NODE_TYPES.TSAsExpression ||
                    expressionType === utils_1.TSESTree.AST_NODE_TYPES.TSNonNullExpression ||
                    expressionType === utils_1.TSESTree.AST_NODE_TYPES.TSTypeAssertion) {
                    rules.ExpressionStatement({
                        ...node,
                        expression: node.expression.expression,
                    });
                    return;
                }
                rules.ExpressionStatement(node);
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'no-unsafe-type-assertion',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow type assertions that narrow a type',
            requiresTypeChecking: true,
        },
        messages: {
            unsafeOfAnyTypeAssertion: 'Unsafe assertion from {{type}} detected: consider using type guards or a safer assertion.',
            unsafeToAnyTypeAssertion: 'Unsafe assertion to {{type}} detected: consider using a more specific type to ensure safety.',
            unsafeToUnconstrainedTypeAssertion: "Unsafe type assertion: '{{type}}' could be instantiated with an arbitrary type which could be unrelated to the original type.",
            unsafeTypeAssertion: "Unsafe type assertion: type '{{type}}' is more narrow than the original type.",
            unsafeTypeAssertionAssignableToConstraint: "Unsafe type assertion: the original type is assignable to the constraint of type '{{type}}', but '{{type}}' could be instantiated with a different subtype of its constraint.",
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const services = (0, util_1.getParserServices)(context);
        const checker = services.program.getTypeChecker();
        function getAnyTypeName(type) {
            return tsutils.isIntrinsicErrorType(type) ? 'error typed' : '`any`';
        }
        function isObjectLiteralType(type) {
            return (tsutils.isObjectType(type) &&
                tsutils.isObjectFlagSet(type, ts.ObjectFlags.ObjectLiteral));
        }
        function checkExpression(node) {
            const expressionType = services.getTypeAtLocation(node.expression);
            const assertedType = services.getTypeAtLocation(node.typeAnnotation);
            if (expressionType === assertedType) {
                return;
            }
            // handle cases when asserting unknown ==> any.
            if ((0, util_1.isTypeAnyType)(assertedType) && (0, util_1.isTypeUnknownType)(expressionType)) {
                context.report({
                    node,
                    messageId: 'unsafeToAnyTypeAssertion',
                    data: {
                        type: '`any`',
                    },
                });
                return;
            }
            const unsafeExpressionAny = (0, util_1.isUnsafeAssignment)(expressionType, assertedType, checker, node.expression);
            if (unsafeExpressionAny) {
                context.report({
                    node,
                    messageId: 'unsafeOfAnyTypeAssertion',
                    data: {
                        type: getAnyTypeName(unsafeExpressionAny.sender),
                    },
                });
                return;
            }
            const unsafeAssertedAny = (0, util_1.isUnsafeAssignment)(assertedType, expressionType, checker, node.typeAnnotation);
            if (unsafeAssertedAny) {
                context.report({
                    node,
                    messageId: 'unsafeToAnyTypeAssertion',
                    data: {
                        type: getAnyTypeName(unsafeAssertedAny.sender),
                    },
                });
                return;
            }
            // Use the widened type in case of an object literal so `isTypeAssignableTo()`
            // won't fail on excess property check.
            const expressionWidenedType = isObjectLiteralType(expressionType)
                ? checker.getWidenedType(expressionType)
                : expressionType;
            const isAssertionSafe = checker.isTypeAssignableTo(expressionWidenedType, assertedType);
            if (isAssertionSafe) {
                return;
            }
            // Produce a more specific error message when targeting a type parameter
            if (tsutils.isTypeParameter(assertedType)) {
                const assertedTypeConstraint = checker.getBaseConstraintOfType(assertedType);
                if (!assertedTypeConstraint) {
                    // asserting to an unconstrained type parameter is unsafe
                    context.report({
                        node,
                        messageId: 'unsafeToUnconstrainedTypeAssertion',
                        data: {
                            type: checker.typeToString(assertedType),
                        },
                    });
                    return;
                }
                // special case message if the original type is assignable to the
                // constraint of the target type parameter
                const isAssignableToConstraint = checker.isTypeAssignableTo(expressionWidenedType, assertedTypeConstraint);
                if (isAssignableToConstraint) {
                    context.report({
                        node,
                        messageId: 'unsafeTypeAssertionAssignableToConstraint',
                        data: {
                            type: checker.typeToString(assertedType),
                        },
                    });
                    return;
                }
            }
            // General error message
            context.report({
                node,
                messageId: 'unsafeTypeAssertion',
                data: {
                    type: checker.typeToString(assertedType),
                },
            });
        }
        return {
            'TSAsExpression, TSTypeAssertion'(node) {
                checkExpression(node);
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_manager_1 = require("@typescript-eslint/scope-manager");
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
const referenceContainsTypeQuery_1 = require("../util/referenceContainsTypeQuery");
exports.default = (0, util_1.createRule)({
    name: 'no-unused-vars',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow unused variables',
            extendsBaseRule: true,
            recommended: 'recommended',
        },
        messages: {
            unusedVar: "'{{varName}}' is {{action}} but never used{{additional}}.",
            usedIgnoredVar: "'{{varName}}' is marked as ignored but is used{{additional}}.",
            usedOnlyAsType: "'{{varName}}' is {{action}} but only used as a type{{additional}}.",
        },
        schema: [
            {
                oneOf: [
                    {
                        type: 'string',
                        enum: ['all', 'local'],
                    },
                    {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            args: {
                                type: 'string',
                                description: 'Whether to check all, some, or no arguments.',
                                enum: ['all', 'after-used', 'none'],
                            },
                            argsIgnorePattern: {
                                type: 'string',
                                description: 'Regular expressions of argument names to not check for usage.',
                            },
                            caughtErrors: {
                                type: 'string',
                                description: 'Whether to check catch block arguments.',
                                enum: ['all', 'none'],
                            },
                            caughtErrorsIgnorePattern: {
                                type: 'string',
                                description: 'Regular expressions of catch block argument names to not check for usage.',
                            },
                            destructuredArrayIgnorePattern: {
                                type: 'string',
                                description: 'Regular expressions of destructured array variable names to not check for usage.',
                            },
                            ignoreClassWithStaticInitBlock: {
                                type: 'boolean',
                                description: 'Whether to ignore classes with at least one static initialization block.',
                            },
                            ignoreRestSiblings: {
                                type: 'boolean',
                                description: 'Whether to ignore sibling properties in `...` destructurings.',
                            },
                            reportUsedIgnorePattern: {
                                type: 'boolean',
                                description: 'Whether to report variables that match any of the valid ignore pattern options if they have been used.',
                            },
                            vars: {
                                type: 'string',
                                description: 'Whether to check all variables or only locally-declared variables.',
                                enum: ['all', 'local'],
                            },
                            varsIgnorePattern: {
                                type: 'string',
                                description: 'Regular expressions of variable names to not check for usage.',
                            },
                        },
                    },
                ],
            },
        ],
    },
    defaultOptions: [{}],
    create(context, [firstOption]) {
        const MODULE_DECL_CACHE = new Map();
        const options = (() => {
            const options = {
                args: 'after-used',
                caughtErrors: 'all',
                ignoreClassWithStaticInitBlock: false,
                ignoreRestSiblings: false,
                reportUsedIgnorePattern: false,
                vars: 'all',
            };
            if (typeof firstOption === 'string') {
                options.vars = firstOption;
            }
            else {
                options.vars = firstOption.vars ?? options.vars;
                options.args = firstOption.args ?? options.args;
                options.ignoreRestSiblings =
                    firstOption.ignoreRestSiblings ?? options.ignoreRestSiblings;
                options.caughtErrors = firstOption.caughtErrors ?? options.caughtErrors;
                options.ignoreClassWithStaticInitBlock =
                    firstOption.ignoreClassWithStaticInitBlock ??
                        options.ignoreClassWithStaticInitBlock;
                options.reportUsedIgnorePattern =
                    firstOption.reportUsedIgnorePattern ??
                        options.reportUsedIgnorePattern;
                if (firstOption.varsIgnorePattern) {
                    options.varsIgnorePattern = new RegExp(firstOption.varsIgnorePattern, 'u');
                }
                if (firstOption.argsIgnorePattern) {
                    options.argsIgnorePattern = new RegExp(firstOption.argsIgnorePattern, 'u');
                }
                if (firstOption.caughtErrorsIgnorePattern) {
                    options.caughtErrorsIgnorePattern = new RegExp(firstOption.caughtErrorsIgnorePattern, 'u');
                }
                if (firstOption.destructuredArrayIgnorePattern) {
                    options.destructuredArrayIgnorePattern = new RegExp(firstOption.destructuredArrayIgnorePattern, 'u');
                }
            }
            return options;
        })();
        /**
         * Determines what variable type a def is.
         * @param def the declaration to check
         * @returns a simple name for the types of variables that this rule supports
         */
        function defToVariableType(def) {
            /*
             * This `destructuredArrayIgnorePattern` error report works differently from the catch
             * clause and parameter error reports. _Both_ the `varsIgnorePattern` and the
             * `destructuredArrayIgnorePattern` will be checked for array destructuring. However,
             * for the purposes of the report, the currently defined behavior is to only inform the
             * user of the `destructuredArrayIgnorePattern` if it's present (regardless of the fact
             * that the `varsIgnorePattern` would also apply). If it's not present, the user will be
             * informed of the `varsIgnorePattern`, assuming that's present.
             */
            if (options.destructuredArrayIgnorePattern &&
                def.name.parent.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
                return 'array-destructure';
            }
            switch (def.type) {
                case scope_manager_1.DefinitionType.CatchClause:
                    return 'catch-clause';
                case scope_manager_1.DefinitionType.Parameter:
                    return 'parameter';
                default:
                    return 'variable';
            }
        }
        /**
         * Gets a given variable's description and configured ignore pattern
         * based on the provided variableType
         * @param variableType a simple name for the types of variables that this rule supports
         * @returns the given variable's description and
         * ignore pattern
         */
        function getVariableDescription(variableType) {
            switch (variableType) {
                case 'array-destructure':
                    return {
                        pattern: options.destructuredArrayIgnorePattern?.toString(),
                        variableDescription: 'elements of array destructuring',
                    };
                case 'catch-clause':
                    return {
                        pattern: options.caughtErrorsIgnorePattern?.toString(),
                        variableDescription: 'caught errors',
                    };
                case 'parameter':
                    return {
                        pattern: options.argsIgnorePattern?.toString(),
                        variableDescription: 'args',
                    };
                case 'variable':
                    return {
                        pattern: options.varsIgnorePattern?.toString(),
                        variableDescription: 'vars',
                    };
            }
        }
        /**
         * Generates the message data about the variable being defined and unused,
         * including the ignore pattern if configured.
         * @param unusedVar eslint-scope variable object.
         * @returns The message data to be used with this unused variable.
         */
        function getDefinedMessageData(unusedVar) {
            const def = unusedVar.defs.at(0);
            let additionalMessageData = '';
            if (def) {
                const { pattern, variableDescription } = getVariableDescription(defToVariableType(def));
                if (pattern && variableDescription) {
                    additionalMessageData = `. Allowed unused ${variableDescription} must match ${pattern}`;
                }
            }
            return {
                action: 'defined',
                additional: additionalMessageData,
                varName: unusedVar.name,
            };
        }
        /**
         * Generate the warning message about the variable being
         * assigned and unused, including the ignore pattern if configured.
         * @param unusedVar eslint-scope variable object.
         * @returns The message data to be used with this unused variable.
         */
        function getAssignedMessageData(unusedVar) {
            const def = unusedVar.defs.at(0);
            let additionalMessageData = '';
            if (def) {
                const { pattern, variableDescription } = getVariableDescription(defToVariableType(def));
                if (pattern && variableDescription) {
                    additionalMessageData = `. Allowed unused ${variableDescription} must match ${pattern}`;
                }
            }
            return {
                action: 'assigned a value',
                additional: additionalMessageData,
                varName: unusedVar.name,
            };
        }
        /**
         * Generate the warning message about a variable being used even though
         * it is marked as being ignored.
         * @param variable eslint-scope variable object
         * @param variableType a simple name for the types of variables that this rule supports
         * @returns The message data to be used with this used ignored variable.
         */
        function getUsedIgnoredMessageData(variable, variableType) {
            const { pattern, variableDescription } = getVariableDescription(variableType);
            let additionalMessageData = '';
            if (pattern && variableDescription) {
                additionalMessageData = `. Used ${variableDescription} must not match ${pattern}`;
            }
            return {
                additional: additionalMessageData,
                varName: variable.name,
            };
        }
        function collectUnusedVariables() {
            /**
             * Checks whether a node is a sibling of the rest property or not.
             * @param node a node to check
             * @returns True if the node is a sibling of the rest property, otherwise false.
             */
            function hasRestSibling(node) {
                return (node.type === utils_1.AST_NODE_TYPES.Property &&
                    node.parent.type === utils_1.AST_NODE_TYPES.ObjectPattern &&
                    node.parent.properties[node.parent.properties.length - 1].type ===
                        utils_1.AST_NODE_TYPES.RestElement);
            }
            /**
             * Determines if a variable has a sibling rest property
             * @param variable eslint-scope variable object.
             * @returns True if the variable is exported, false if not.
             */
            function hasRestSpreadSibling(variable) {
                if (options.ignoreRestSiblings) {
                    const hasRestSiblingDefinition = variable.defs.some(def => hasRestSibling(def.name.parent));
                    const hasRestSiblingReference = variable.references.some(ref => hasRestSibling(ref.identifier.parent));
                    return hasRestSiblingDefinition || hasRestSiblingReference;
                }
                return false;
            }
            /**
             * Checks whether the given variable is after the last used parameter.
             * @param variable The variable to check.
             * @returns `true` if the variable is defined after the last used parameter.
             */
            function isAfterLastUsedArg(variable) {
                const def = variable.defs[0];
                const params = context.sourceCode.getDeclaredVariables(def.node);
                const posteriorParams = params.slice(params.indexOf(variable) + 1);
                // If any used parameters occur after this parameter, do not report.
                return !posteriorParams.some(v => v.references.length > 0 || v.eslintUsed);
            }
            const analysisResults = (0, util_1.collectVariables)(context);
            const variables = [
                ...Array.from(analysisResults.unusedVariables, variable => ({
                    used: false,
                    variable,
                })),
                ...Array.from(analysisResults.usedVariables, variable => ({
                    used: true,
                    variable,
                })),
            ];
            const unusedVariablesReturn = [];
            for (const { used, variable } of variables) {
                // explicit global variables don't have definitions.
                if (variable.defs.length === 0) {
                    if (!used) {
                        unusedVariablesReturn.push(variable);
                    }
                    continue;
                }
                const def = variable.defs[0];
                if (variable.scope.type === utils_1.TSESLint.Scope.ScopeType.global &&
                    options.vars === 'local') {
                    // skip variables in the global scope if configured to
                    continue;
                }
                const refUsedInArrayPatterns = variable.references.some(ref => ref.identifier.parent.type === utils_1.AST_NODE_TYPES.ArrayPattern);
                // skip elements of array destructuring patterns
                if ((def.name.parent.type === utils_1.AST_NODE_TYPES.ArrayPattern ||
                    refUsedInArrayPatterns) &&
                    def.name.type === utils_1.AST_NODE_TYPES.Identifier &&
                    options.destructuredArrayIgnorePattern?.test(def.name.name)) {
                    if (options.reportUsedIgnorePattern && used) {
                        context.report({
                            node: def.name,
                            messageId: 'usedIgnoredVar',
                            data: getUsedIgnoredMessageData(variable, 'array-destructure'),
                        });
                    }
                    continue;
                }
                if (def.type === utils_1.TSESLint.Scope.DefinitionType.ClassName) {
                    const hasStaticBlock = def.node.body.body.some(node => node.type === utils_1.AST_NODE_TYPES.StaticBlock);
                    if (options.ignoreClassWithStaticInitBlock && hasStaticBlock) {
                        continue;
                    }
                }
                // skip catch variables
                if (def.type === utils_1.TSESLint.Scope.DefinitionType.CatchClause) {
                    if (options.caughtErrors === 'none') {
                        continue;
                    }
                    // skip ignored parameters
                    if (def.name.type === utils_1.AST_NODE_TYPES.Identifier &&
                        options.caughtErrorsIgnorePattern?.test(def.name.name)) {
                        if (options.reportUsedIgnorePattern && used) {
                            context.report({
                                node: def.name,
                                messageId: 'usedIgnoredVar',
                                data: getUsedIgnoredMessageData(variable, 'catch-clause'),
                            });
                        }
                        continue;
                    }
                }
                else if (def.type === utils_1.TSESLint.Scope.DefinitionType.Parameter) {
                    // if "args" option is "none", skip any parameter
                    if (options.args === 'none') {
                        continue;
                    }
                    // skip ignored parameters
                    if (def.name.type === utils_1.AST_NODE_TYPES.Identifier &&
                        options.argsIgnorePattern?.test(def.name.name)) {
                        if (options.reportUsedIgnorePattern && used) {
                            context.report({
                                node: def.name,
                                messageId: 'usedIgnoredVar',
                                data: getUsedIgnoredMessageData(variable, 'parameter'),
                            });
                        }
                        continue;
                    }
                    // if "args" option is "after-used", skip used variables
                    if (options.args === 'after-used' &&
                        (0, util_1.isFunction)(def.name.parent) &&
                        !isAfterLastUsedArg(variable)) {
                        continue;
                    }
                }
                // skip ignored variables
                else if (def.name.type === utils_1.AST_NODE_TYPES.Identifier &&
                    options.varsIgnorePattern?.test(def.name.name)) {
                    if (options.reportUsedIgnorePattern &&
                        used &&
                        /* enum members are always marked as 'used' by `collectVariables`, but in reality they may be used or
                           unused. either way, don't complain about their naming. */
                        def.type !== utils_1.TSESLint.Scope.DefinitionType.TSEnumMember) {
                        context.report({
                            node: def.name,
                            messageId: 'usedIgnoredVar',
                            data: getUsedIgnoredMessageData(variable, 'variable'),
                        });
                    }
                    continue;
                }
                if (hasRestSpreadSibling(variable)) {
                    continue;
                }
                // in case another rule has run and used the collectUnusedVariables,
                // we want to ensure our selectors that marked variables as used are respected
                if (variable.eslintUsed) {
                    continue;
                }
                if (!used) {
                    unusedVariablesReturn.push(variable);
                }
            }
            return unusedVariablesReturn;
        }
        return {
            // top-level declaration file handling
            [ambientDeclarationSelector(utils_1.AST_NODE_TYPES.Program)](node) {
                if (!(0, util_1.isDefinitionFile)(context.filename)) {
                    return;
                }
                const moduleDecl = (0, util_1.nullThrows)(node.parent, util_1.NullThrowsReasons.MissingParent);
                if (checkForOverridingExportStatements(moduleDecl)) {
                    return;
                }
                markDeclarationChildAsUsed(node);
            },
            // children of a namespace that is a child of a declared namespace are auto-exported
            [ambientDeclarationSelector('TSModuleDeclaration[declare = true] > TSModuleBlock TSModuleDeclaration > TSModuleBlock')](node) {
                const moduleDecl = (0, util_1.nullThrows)(node.parent.parent, util_1.NullThrowsReasons.MissingParent);
                if (checkForOverridingExportStatements(moduleDecl)) {
                    return;
                }
                markDeclarationChildAsUsed(node);
            },
            // declared namespace handling
            [ambientDeclarationSelector('TSModuleDeclaration[declare = true] > TSModuleBlock')](node) {
                const moduleDecl = (0, util_1.nullThrows)(node.parent.parent, util_1.NullThrowsReasons.MissingParent);
                if (checkForOverridingExportStatements(moduleDecl)) {
                    return;
                }
                markDeclarationChildAsUsed(node);
            },
            // namespace handling in definition files
            [ambientDeclarationSelector('TSModuleDeclaration > TSModuleBlock')](node) {
                if (!(0, util_1.isDefinitionFile)(context.filename)) {
                    return;
                }
                const moduleDecl = (0, util_1.nullThrows)(node.parent.parent, util_1.NullThrowsReasons.MissingParent);
                if (checkForOverridingExportStatements(moduleDecl)) {
                    return;
                }
                markDeclarationChildAsUsed(node);
            },
            // collect
            'Program:exit'(programNode) {
                const unusedVars = collectUnusedVariables();
                for (const unusedVar of unusedVars) {
                    // Report the first declaration.
                    if (unusedVar.defs.length > 0) {
                        const usedOnlyAsType = unusedVar.references.some(ref => (0, referenceContainsTypeQuery_1.referenceContainsTypeQuery)(ref.identifier));
                        const isImportUsedOnlyAsType = usedOnlyAsType &&
                            unusedVar.defs.some(def => def.type === scope_manager_1.DefinitionType.ImportBinding);
                        if (isImportUsedOnlyAsType) {
                            continue;
                        }
                        const writeReferences = unusedVar.references.filter(ref => ref.isWrite() &&
                            ref.from.variableScope === unusedVar.scope.variableScope);
                        const id = writeReferences.length
                            ? writeReferences[writeReferences.length - 1].identifier
                            : unusedVar.identifiers[0];
                        const messageId = usedOnlyAsType ? 'usedOnlyAsType' : 'unusedVar';
                        const { start } = id.loc;
                        const idLength = id.name.length;
                        const loc = {
                            start,
                            end: {
                                column: start.column + idLength,
                                line: start.line,
                            },
                        };
                        context.report({
                            loc,
                            messageId,
                            data: unusedVar.references.some(ref => ref.isWrite())
                                ? getAssignedMessageData(unusedVar)
                                : getDefinedMessageData(unusedVar),
                        });
                        // If there are no regular declaration, report the first `/*globals*/` comment directive.
                    }
                    else if ('eslintExplicitGlobalComments' in unusedVar &&
                        unusedVar.eslintExplicitGlobalComments) {
                        const directiveComment = unusedVar.eslintExplicitGlobalComments[0];
                        context.report({
                            loc: (0, util_1.getNameLocationInGlobalDirectiveComment)(context.sourceCode, directiveComment, unusedVar.name),
                            node: programNode,
                            messageId: 'unusedVar',
                            data: getDefinedMessageData(unusedVar),
                        });
                    }
                }
            },
        };
        function checkForOverridingExportStatements(node) {
            const cached = MODULE_DECL_CACHE.get(node);
            if (cached != null) {
                return cached;
            }
            const body = getStatementsOfNode(node);
            if (hasOverridingExportStatement(body)) {
                MODULE_DECL_CACHE.set(node, true);
                return true;
            }
            MODULE_DECL_CACHE.set(node, false);
            return false;
        }
        function ambientDeclarationSelector(parent) {
            return [
                // Types are ambiently exported
                `${parent} > :matches(${[
                    utils_1.AST_NODE_TYPES.TSInterfaceDeclaration,
                    utils_1.AST_NODE_TYPES.TSTypeAliasDeclaration,
                ].join(', ')})`,
                // Value things are ambiently exported if they are "declare"d
                `${parent} > :matches(${[
                    utils_1.AST_NODE_TYPES.ClassDeclaration,
                    utils_1.AST_NODE_TYPES.TSDeclareFunction,
                    utils_1.AST_NODE_TYPES.TSEnumDeclaration,
                    utils_1.AST_NODE_TYPES.TSModuleDeclaration,
                    utils_1.AST_NODE_TYPES.VariableDeclaration,
                ].join(', ')})`,
            ].join(', ');
        }
        function markDeclarationChildAsUsed(node) {
            const identifiers = [];
            switch (node.type) {
                case utils_1.AST_NODE_TYPES.TSInterfaceDeclaration:
                case utils_1.AST_NODE_TYPES.TSTypeAliasDeclaration:
                case utils_1.AST_NODE_TYPES.ClassDeclaration:
                case utils_1.AST_NODE_TYPES.FunctionDeclaration:
                case utils_1.AST_NODE_TYPES.TSDeclareFunction:
                case utils_1.AST_NODE_TYPES.TSEnumDeclaration:
                case utils_1.AST_NODE_TYPES.TSModuleDeclaration:
                    if (node.id?.type === utils_1.AST_NODE_TYPES.Identifier) {
                        identifiers.push(node.id);
                    }
                    break;
                case utils_1.AST_NODE_TYPES.VariableDeclaration:
                    for (const declaration of node.declarations) {
                        visitPattern(declaration, pattern => {
                            identifiers.push(pattern);
                        });
                    }
                    break;
            }
            let scope = context.sourceCode.getScope(node);
            const shouldUseUpperScope = [
                utils_1.AST_NODE_TYPES.TSDeclareFunction,
                utils_1.AST_NODE_TYPES.TSModuleDeclaration,
            ].includes(node.type);
            if (scope.variableScope !== scope) {
                scope = scope.variableScope;
            }
            else if (shouldUseUpperScope && scope.upper) {
                scope = scope.upper;
            }
            for (const id of identifiers) {
                const superVar = scope.set.get(id.name);
                if (superVar) {
                    superVar.eslintUsed = true;
                }
            }
        }
        function visitPattern(node, cb) {
            const visitor = new scope_manager_1.PatternVisitor({}, node, cb);
            visitor.visit(node);
        }
    },
});
function hasOverridingExportStatement(body) {
    for (const statement of body) {
        if ((statement.type === utils_1.AST_NODE_TYPES.ExportNamedDeclaration &&
            statement.declaration == null) ||
            statement.type === utils_1.AST_NODE_TYPES.ExportAllDeclaration ||
            statement.type === utils_1.AST_NODE_TYPES.TSExportAssignment) {
            return true;
        }
        if (statement.type === utils_1.AST_NODE_TYPES.ExportDefaultDeclaration &&
            statement.declaration.type === utils_1.AST_NODE_TYPES.Identifier) {
            return true;
        }
    }
    return false;
}
function getStatementsOfNode(block) {
    if (block.type === utils_1.AST_NODE_TYPES.Program) {
        return block.body;
    }
    return block.body.body;
}
/*

###### TODO ######

Edge cases that aren't currently handled due to laziness and them being super edgy edge cases


--- function params referenced in typeof type refs in the function declaration ---
--- NOTE - TS gets these cases wrong

function _foo(
  arg: number // arg should be unused
): typeof arg {
  return 1 as any;
}

function _bar(
  arg: number, // arg should be unused
  _arg2: typeof arg,
) {}


--- function names referenced in typeof type refs in the function declaration ---
--- NOTE - TS gets these cases right

function foo( // foo should be unused
): typeof foo {
    return 1 as any;
}

function bar( // bar should be unused
  _arg: typeof bar
) {}


--- if an interface is merged into a namespace  ---
--- NOTE - TS gets these cases wrong

namespace Test {
    interface Foo { // Foo should be unused here
        a: string;
    }
    export namespace Foo {
       export type T = 'b';
    }
}
type T = Test.Foo; // Error: Namespace 'Test' has no exported member 'Foo'.


namespace Test {
    export interface Foo {
        a: string;
    }
    namespace Foo { // Foo should be unused here
       export type T = 'b';
    }
}
type T = Test.Foo.T; // Error: Namespace 'Test' has no exported member 'Foo'.

---

These cases are mishandled because the base rule assumes that each variable has one def, but type-value shadowing
creates a variable with two defs

--- type-only or value-only references to type/value shadowed variables ---
--- NOTE - TS gets these cases wrong

type T = 1;
const T = 2; // this T should be unused

type U = T; // this U should be unused
const U = 3;

const _V = U;


--- partially exported type/value shadowed variables ---
--- NOTE - TS gets these cases wrong

export interface Foo {}
const Foo = 1; // this Foo should be unused

interface Bar {} // this Bar should be unused
export const Bar = 1;

*/
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scope_manager_1 = require("@typescript-eslint/scope-manager");
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
const referenceContainsTypeQuery_1 = require("../util/referenceContainsTypeQuery");
const SENTINEL_TYPE = /^(?:(?:Function|Class)(?:Declaration|Expression)|ArrowFunctionExpression|CatchClause|ImportDeclaration|ExportNamedDeclaration)$/;
/**
 * Parses a given value as options.
 */
function parseOptions(options) {
    let functions = true;
    let classes = true;
    let enums = true;
    let variables = true;
    let typedefs = true;
    let ignoreTypeReferences = true;
    let allowNamedExports = false;
    if (typeof options === 'string') {
        functions = options !== 'nofunc';
    }
    else if (typeof options === 'object' && options != null) {
        functions = options.functions !== false;
        classes = options.classes !== false;
        enums = options.enums !== false;
        variables = options.variables !== false;
        typedefs = options.typedefs !== false;
        ignoreTypeReferences = options.ignoreTypeReferences !== false;
        allowNamedExports = options.allowNamedExports !== false;
    }
    return {
        allowNamedExports,
        classes,
        enums,
        functions,
        ignoreTypeReferences,
        typedefs,
        variables,
    };
}
/**
 * Checks whether or not a given variable is a function declaration.
 */
function isFunction(variable) {
    return variable.defs[0].type === scope_manager_1.DefinitionType.FunctionName;
}
/**
 * Checks whether or not a given variable is a type declaration.
 */
function isTypedef(variable) {
    return variable.defs[0].type === scope_manager_1.DefinitionType.Type;
}
/**
 * Checks whether or not a given variable is a enum declaration.
 */
function isOuterEnum(variable, reference) {
    return (variable.defs[0].type === scope_manager_1.DefinitionType.TSEnumName &&
        variable.scope.variableScope !== reference.from.variableScope);
}
/**
 * Checks whether or not a given variable is a class declaration in an upper function scope.
 */
function isOuterClass(variable, reference) {
    return (variable.defs[0].type === scope_manager_1.DefinitionType.ClassName &&
        variable.scope.variableScope !== reference.from.variableScope);
}
/**
 * Checks whether or not a given variable is a variable declaration in an upper function scope.
 */
function isOuterVariable(variable, reference) {
    return (variable.defs[0].type === scope_manager_1.DefinitionType.Variable &&
        variable.scope.variableScope !== reference.from.variableScope);
}
/**
 * Checks whether or not a given reference is a export reference.
 */
function isNamedExports(reference) {
    const { identifier } = reference;
    return (identifier.parent.type === utils_1.AST_NODE_TYPES.ExportSpecifier &&
        identifier.parent.local === identifier);
}
/**
 * Checks whether or not a given reference is a type reference.
 */
function isTypeReference(reference) {
    return (reference.isTypeReference ||
        (0, referenceContainsTypeQuery_1.referenceContainsTypeQuery)(reference.identifier));
}
/**
 * Checks whether or not a given location is inside of the range of a given node.
 */
function isInRange(node, location) {
    return !!node && node.range[0] <= location && location <= node.range[1];
}
/**
 * Decorators are transpiled such that the decorator is placed after the class declaration
 * So it is considered safe
 */
function isClassRefInClassDecorator(variable, reference) {
    if (variable.defs[0].type !== scope_manager_1.DefinitionType.ClassName ||
        variable.defs[0].node.decorators.length === 0) {
        return false;
    }
    for (const deco of variable.defs[0].node.decorators) {
        if (reference.identifier.range[0] >= deco.range[0] &&
            reference.identifier.range[1] <= deco.range[1]) {
            return true;
        }
    }
    return false;
}
/**
 * Checks whether or not a given reference is inside of the initializers of a given variable.
 *
 * @returns `true` in the following cases:
 * - var a = a
 * - var [a = a] = list
 * - var {a = a} = obj
 * - for (var a in a) {}
 * - for (var a of a) {}
 */
function isInInitializer(variable, reference) {
    if (variable.scope !== reference.from) {
        return false;
    }
    let node = variable.identifiers[0].parent;
    const location = reference.identifier.range[1];
    while (node) {
        if (node.type === utils_1.AST_NODE_TYPES.VariableDeclarator) {
            if (isInRange(node.init, location)) {
                return true;
            }
            if ((node.parent.parent.type === utils_1.AST_NODE_TYPES.ForInStatement ||
                node.parent.parent.type === utils_1.AST_NODE_TYPES.ForOfStatement) &&
                isInRange(node.parent.parent.right, location)) {
                return true;
            }
            break;
        }
        else if (node.type === utils_1.AST_NODE_TYPES.AssignmentPattern) {
            if (isInRange(node.right, location)) {
                return true;
            }
        }
        else if (SENTINEL_TYPE.test(node.type)) {
            break;
        }
        node = node.parent;
    }
    return false;
}
exports.default = (0, util_1.createRule)({
    name: 'no-use-before-define',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow the use of variables before they are defined',
            extendsBaseRule: true,
        },
        messages: {
            noUseBeforeDefine: "'{{name}}' was used before it was defined.",
        },
        schema: [
            {
                oneOf: [
                    {
                        type: 'string',
                        enum: ['nofunc'],
                    },
                    {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            allowNamedExports: {
                                type: 'boolean',
                                description: 'Whether to ignore named exports.',
                            },
                            classes: {
                                type: 'boolean',
                                description: 'Whether to ignore references to class declarations.',
                            },
                            enums: {
                                type: 'boolean',
                                description: 'Whether to check references to enums.',
                            },
                            functions: {
                                type: 'boolean',
                                description: 'Whether to ignore references to function declarations.',
                            },
                            ignoreTypeReferences: {
                                type: 'boolean',
                                description: 'Whether to ignore type references, such as in type annotations and assertions.',
                            },
                            typedefs: {
                                type: 'boolean',
                                description: 'Whether to check references to types.',
                            },
                            variables: {
                                type: 'boolean',
                                description: 'Whether to ignore references to variables.',
                            },
                        },
                    },
                ],
            },
        ],
    },
    defaultOptions: [
        {
            allowNamedExports: false,
            classes: true,
            enums: true,
            functions: true,
            ignoreTypeReferences: true,
            typedefs: true,
            variables: true,
        },
    ],
    create(context, optionsWithDefault) {
        const options = parseOptions(optionsWithDefault[0]);
        /**
         * Determines whether a given use-before-define case should be reported according to the options.
         * @param variable The variable that gets used before being defined
         * @param reference The reference to the variable
         */
        function isForbidden(variable, reference) {
            if (options.ignoreTypeReferences && isTypeReference(reference)) {
                return false;
            }
            if (isFunction(variable)) {
                return options.functions;
            }
            if (isOuterClass(variable, reference)) {
                return options.classes;
            }
            if (isOuterVariable(variable, reference)) {
                return options.variables;
            }
            if (isOuterEnum(variable, reference)) {
                return options.enums;
            }
            if (isTypedef(variable)) {
                return options.typedefs;
            }
            return true;
        }
        function isDefinedBeforeUse(variable, reference) {
            return (variable.identifiers[0].range[1] <= reference.identifier.range[1] &&
                !(reference.isValueReference && isInInitializer(variable, reference)));
        }
        /**
         * Finds and validates all variables in a given scope.
         */
        function findVariablesInScope(scope) {
            scope.references.forEach(reference => {
                const variable = reference.resolved;
                function report() {
                    context.report({
                        node: reference.identifier,
                        messageId: 'noUseBeforeDefine',
                        data: {
                            name: reference.identifier.name,
                        },
                    });
                }
                // Skips when the reference is:
                // - initializations.
                // - referring to an undefined variable.
                // - referring to a global environment variable (there're no identifiers).
                // - located preceded by the variable (except in initializers).
                // - allowed by options.
                if (reference.init) {
                    return;
                }
                if (!options.allowNamedExports && isNamedExports(reference)) {
                    if (!variable || !isDefinedBeforeUse(variable, reference)) {
                        report();
                    }
                    return;
                }
                if (!variable) {
                    return;
                }
                if (variable.identifiers.length === 0 ||
                    isDefinedBeforeUse(variable, reference) ||
                    !isForbidden(variable, reference) ||
                    isClassRefInClassDecorator(variable, reference) ||
                    reference.from.type === utils_1.TSESLint.Scope.ScopeType.functionType) {
                    return;
                }
                // Reports.
                report();
            });
            scope.childScopes.forEach(findVariablesInScope);
        }
        return {
            Program(node) {
                findVariablesInScope(context.sourceCode.getScope(node));
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
const getESLintCoreRule_1 = require("../util/getESLintCoreRule");
const baseRule = (0, getESLintCoreRule_1.getESLintCoreRule)('no-useless-constructor');
/**
 * Check if method with accessibility is not useless
 */
function checkAccessibility(node) {
    switch (node.accessibility) {
        case 'protected':
        case 'private':
            return false;
        case 'public':
            if (node.parent.parent.superClass) {
                return false;
            }
            break;
    }
    return true;
}
/**
 * Check if method is not useless due to typescript parameter properties and decorators
 */
function checkParams(node) {
    return !node.value.params.some(param => param.type === utils_1.AST_NODE_TYPES.TSParameterProperty ||
        param.decorators.length);
}
exports.default = (0, util_1.createRule)({
    name: 'no-useless-constructor',
    meta: {
        type: 'problem',
        // defaultOptions, -- base rule does not use defaultOptions
        docs: {
            description: 'Disallow unnecessary constructors',
            extendsBaseRule: true,
            recommended: 'strict',
        },
        hasSuggestions: baseRule.meta.hasSuggestions,
        messages: baseRule.meta.messages,
        schema: baseRule.meta.schema,
    },
    defaultOptions: [],
    create(context) {
        const rules = baseRule.create(context);
        return {
            MethodDefinition(node) {
                if (node.value.type === utils_1.AST_NODE_TYPES.FunctionExpression &&
                    checkAccessibility(node) &&
                    checkParams(node)) {
                    rules.MethodDefinition(node);
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
function isEmptyExport(node) {
    return (node.type === utils_1.AST_NODE_TYPES.ExportNamedDeclaration &&
        node.specifiers.length === 0 &&
        !node.declaration);
}
const exportOrImportNodeTypes = new Set([
    utils_1.AST_NODE_TYPES.ExportAllDeclaration,
    utils_1.AST_NODE_TYPES.ExportDefaultDeclaration,
    utils_1.AST_NODE_TYPES.ExportNamedDeclaration,
    utils_1.AST_NODE_TYPES.ExportSpecifier,
    utils_1.AST_NODE_TYPES.ImportDeclaration,
    utils_1.AST_NODE_TYPES.TSExportAssignment,
    utils_1.AST_NODE_TYPES.TSImportEqualsDeclaration,
]);
exports.default = (0, util_1.createRule)({
    name: 'no-useless-empty-export',
    meta: {
        type: 'suggestion',
        docs: {
            description: "Disallow empty exports that don't change anything in a module file",
        },
        fixable: 'code',
        hasSuggestions: false,
        messages: {
            uselessExport: 'Empty export does nothing and can be removed.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        // In a definition file, export {} is necessary to make the module properly
        // encapsulated, even when there are other exports
        // https://github.com/typescript-eslint/typescript-eslint/issues/4975
        if ((0, util_1.isDefinitionFile)(context.filename)) {
            return {};
        }
        function checkNode(node) {
            if (!Array.isArray(node.body)) {
                return;
            }
            const emptyExports = [];
            let foundOtherExport = false;
            for (const statement of node.body) {
                if (isEmptyExport(statement)) {
                    emptyExports.push(statement);
                }
                else if (exportOrImportNodeTypes.has(statement.type)) {
                    foundOtherExport = true;
                }
            }
            if (foundOtherExport) {
                for (const emptyExport of emptyExports) {
                    context.report({
                        node: emptyExport,
                        messageId: 'uselessExport',
                        fix: fixer => fixer.remove(emptyExport),
                    });
                }
            }
        }
        return {
            Program: checkNode,
            TSModuleDeclaration: checkNode,
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'no-var-requires',
    meta: {
        type: 'problem',
        deprecated: {
            deprecatedSince: '8.0.0',
            replacedBy: [
                {
                    rule: {
                        name: '@typescript-eslint/no-require-imports',
                        url: 'https://typescript-eslint.io/rules/no-require-imports',
                    },
                },
            ],
            url: 'https://github.com/typescript-eslint/typescript-eslint/pull/8334',
        },
        docs: {
            description: 'Disallow `require` statements except in import statements',
        },
        messages: {
            noVarReqs: 'Require statement not part of import statement.',
        },
        replacedBy: ['@typescript-eslint/no-require-imports'],
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    allow: {
                        type: 'array',
                        description: 'Patterns of import paths to allow requiring from.',
                        items: { type: 'string' },
                    },
                },
            },
        ],
    },
    defaultOptions: [{ allow: [] }],
    create(context, options) {
        const allowPatterns = options[0].allow.map(pattern => new RegExp(pattern, 'u'));
        function isImportPathAllowed(importPath) {
            return allowPatterns.some(pattern => importPath.match(pattern));
        }
        function isStringOrTemplateLiteral(node) {
            return ((node.type === utils_1.AST_NODE_TYPES.Literal &&
                typeof node.value === 'string') ||
                node.type === utils_1.AST_NODE_TYPES.TemplateLiteral);
        }
        return {
            'CallExpression[callee.name="require"]'(node) {
                if (node.arguments[0] && isStringOrTemplateLiteral(node.arguments[0])) {
                    const argValue = (0, util_1.getStaticStringValue)(node.arguments[0]);
                    if (typeof argValue === 'string' && isImportPathAllowed(argValue)) {
                        return;
                    }
                }
                const parent = node.parent.type === utils_1.AST_NODE_TYPES.ChainExpression
                    ? node.parent.parent
                    : node.parent;
                if ([
                    utils_1.AST_NODE_TYPES.CallExpression,
                    utils_1.AST_NODE_TYPES.MemberExpression,
                    utils_1.AST_NODE_TYPES.NewExpression,
                    utils_1.AST_NODE_TYPES.TSAsExpression,
                    utils_1.AST_NODE_TYPES.TSTypeAssertion,
                    utils_1.AST_NODE_TYPES.VariableDeclarator,
                ].includes(parent.type)) {
                    const variable = utils_1.ASTUtils.findVariable(context.sourceCode.getScope(node), 'require');
                    if (!variable?.identifiers.length) {
                        context.report({
                            node,
                            messageId: 'noVarReqs',
                        });
                    }
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
const classNames = new Set([
    'BigInt',
    // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
    'Boolean',
    'Number',
    'Object',
    // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
    'String',
    'Symbol',
]);
exports.default = (0, util_1.createRule)({
    name: 'no-wrapper-object-types',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow using confusing built-in primitive class wrappers',
            recommended: 'recommended',
        },
        fixable: 'code',
        messages: {
            bannedClassType: 'Prefer using the primitive `{{preferred}}` as a type name, rather than the upper-cased `{{typeName}}`.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        function checkBannedTypes(node, includeFix) {
            const typeName = node.type === utils_1.AST_NODE_TYPES.Identifier && node.name;
            if (!typeName ||
                !classNames.has(typeName) ||
                !(0, util_1.isReferenceToGlobalFunction)(typeName, node, context.sourceCode)) {
                return;
            }
            const preferred = typeName.toLowerCase();
            context.report({
                node,
                messageId: 'bannedClassType',
                data: { preferred, typeName },
                fix: includeFix
                    ? (fixer) => fixer.replaceText(node, preferred)
                    : undefined,
            });
        }
        return {
            TSClassImplements(node) {
                checkBannedTypes(node.expression, false);
            },
            TSInterfaceHeritage(node) {
                checkBannedTypes(node.expression, false);
            },
            TSTypeReference(node) {
                checkBannedTypes(node.typeName, true);
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectForEachKey = objectForEachKey;
exports.objectMapKey = objectMapKey;
exports.objectReduceKey = objectReduceKey;
function objectForEachKey(obj, callback) {
    const keys = Object.keys(obj);
    for (const key of keys) {
        callback(key);
    }
}
function objectMapKey(obj, callback) {
    const values = [];
    objectForEachKey(obj, key => {
        values.push(callback(key));
    });
    return values;
}
function objectReduceKey(obj, callback, initial) {
    let accumulator = initial;
    objectForEachKey(obj, key => {
        accumulator = callback(accumulator, key);
    });
    return accumulator;
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'non-nullable-type-assertion-style',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce non-null assertions over explicit type assertions',
            recommended: 'stylistic',
            requiresTypeChecking: true,
        },
        fixable: 'code',
        messages: {
            preferNonNullAssertion: 'Use a ! assertion to more succinctly remove null and undefined from the type.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const services = (0, util_1.getParserServices)(context);
        const getTypesIfNotLoose = (node) => {
            const type = services.getTypeAtLocation(node);
            if (tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
                return undefined;
            }
            return tsutils.unionConstituents(type);
        };
        const couldBeNullish = (type) => {
            if (type.flags & ts.TypeFlags.TypeParameter) {
                const constraint = type.getConstraint();
                return constraint == null || couldBeNullish(constraint);
            }
            if (tsutils.isUnionType(type)) {
                for (const part of type.types) {
                    if (couldBeNullish(part)) {
                        return true;
                    }
                }
                return false;
            }
            return (type.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) !== 0;
        };
        const sameTypeWithoutNullish = (assertedTypes, originalTypes) => {
            const nonNullishOriginalTypes = originalTypes.filter(type => (type.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) === 0);
            if (nonNullishOriginalTypes.length === originalTypes.length) {
                return false;
            }
            for (const assertedType of assertedTypes) {
                if (couldBeNullish(assertedType) ||
                    !nonNullishOriginalTypes.includes(assertedType)) {
                    return false;
                }
            }
            for (const originalType of nonNullishOriginalTypes) {
                if (!assertedTypes.includes(originalType)) {
                    return false;
                }
            }
            return true;
        };
        const isConstAssertion = (node) => {
            return (node.typeAnnotation.type === utils_1.AST_NODE_TYPES.TSTypeReference &&
                node.typeAnnotation.typeName.type === utils_1.AST_NODE_TYPES.Identifier &&
                node.typeAnnotation.typeName.name === 'const');
        };
        return {
            'TSAsExpression, TSTypeAssertion'(node) {
                if (isConstAssertion(node)) {
                    return;
                }
                const originalTypes = getTypesIfNotLoose(node.expression);
                if (!originalTypes) {
                    return;
                }
                const assertedTypes = getTypesIfNotLoose(node.typeAnnotation);
                if (!assertedTypes) {
                    return;
                }
                if (sameTypeWithoutNullish(assertedTypes, originalTypes)) {
                    const expressionSourceCode = context.sourceCode.getText(node.expression);
                    const higherPrecedenceThanUnary = (0, util_1.getOperatorPrecedence)(services.esTreeNodeToTSNodeMap.get(node.expression).kind, ts.SyntaxKind.Unknown) > util_1.OperatorPrecedence.Unary;
                    context.report({
                        node,
                        messageId: 'preferNonNullAssertion',
                        fix(fixer) {
                            return fixer.replaceText(node, higherPrecedenceThanUnary
                                ? `${expressionSourceCode}!`
                                : `(${expressionSourceCode})!`);
                        },
                    });
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const ts_api_utils_1 = require("ts-api-utils");
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
const promiseUtils_1 = require("../util/promiseUtils");
exports.default = (0, util_1.createRule)({
    name: 'only-throw-error',
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow throwing non-`Error` values as exceptions',
            extendsBaseRule: 'no-throw-literal',
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        messages: {
            object: 'Expected an error object to be thrown.',
            undef: 'Do not throw undefined.',
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    allow: {
                        ...util_1.typeOrValueSpecifiersSchema,
                        description: 'Type specifiers that can be thrown.',
                    },
                    allowRethrowing: {
                        type: 'boolean',
                        description: 'Whether to allow rethrowing caught values that are not `Error` objects.',
                    },
                    allowThrowingAny: {
                        type: 'boolean',
                        description: 'Whether to always allow throwing values typed as `any`.',
                    },
                    allowThrowingUnknown: {
                        type: 'boolean',
                        description: 'Whether to always allow throwing values typed as `unknown`.',
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            allow: [],
            allowRethrowing: true,
            allowThrowingAny: true,
            allowThrowingUnknown: true,
        },
    ],
    create(context, [options]) {
        const services = (0, util_1.getParserServices)(context);
        const allow = options.allow;
        function isRethrownError(node) {
            if (node.type !== utils_1.AST_NODE_TYPES.Identifier) {
                return false;
            }
            const scope = context.sourceCode.getScope(node);
            const smVariable = (0, util_1.nullThrows)((0, util_1.findVariable)(scope, node), `Variable ${node.name} should exist in scope manager`);
            const variableDefinitions = smVariable.defs.filter(def => def.isVariableDefinition);
            if (variableDefinitions.length !== 1) {
                return false;
            }
            const def = smVariable.defs[0];
            // try { /* ... */ } catch (x) { throw x; }
            if (def.node.type === utils_1.AST_NODE_TYPES.CatchClause) {
                return true;
            }
            // promise.catch(x => { throw x; })
            // promise.then(onFulfilled, x => { throw x; })
            if (def.node.type === utils_1.AST_NODE_TYPES.ArrowFunctionExpression &&
                def.node.params.length >= 1 &&
                def.node.params[0] === def.name &&
                def.node.parent.type === utils_1.AST_NODE_TYPES.CallExpression) {
                const callExpression = def.node.parent;
                const parsedPromiseHandlingCall = (0, promiseUtils_1.parseCatchCall)(callExpression, context) ??
                    (0, promiseUtils_1.parseThenCall)(callExpression, context);
                if (parsedPromiseHandlingCall != null) {
                    const { object, onRejected } = parsedPromiseHandlingCall;
                    if (onRejected === def.node) {
                        const tsObjectNode = services.esTreeNodeToTSNodeMap.get(object);
                        // make sure we're actually dealing with a promise
                        if ((0, ts_api_utils_1.isThenableType)(services.program.getTypeChecker(), tsObjectNode)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        function checkThrowArgument(node) {
            if (node.type === utils_1.AST_NODE_TYPES.AwaitExpression ||
                node.type === utils_1.AST_NODE_TYPES.YieldExpression) {
                return;
            }
            if (options.allowRethrowing && isRethrownError(node)) {
                return;
            }
            const type = services.getTypeAtLocation(node);
            if ((0, util_1.typeMatchesSomeSpecifier)(type, allow, services.program)) {
                return;
            }
            if (type.flags & ts.TypeFlags.Undefined) {
                context.report({ node, messageId: 'undef' });
                return;
            }
            if (options.allowThrowingAny && (0, util_1.isTypeAnyType)(type)) {
                return;
            }
            if (options.allowThrowingUnknown && (0, util_1.isTypeUnknownType)(type)) {
                return;
            }
            if ((0, util_1.isErrorLike)(services.program, type)) {
                return;
            }
            context.report({ node, messageId: 'object' });
        }
        return {
            ThrowStatement(node) {
                checkThrowArgument(node.argument);
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'parameter-properties',
    meta: {
        type: 'problem',
        docs: {
            description: 'Require or disallow parameter properties in class constructors',
        },
        messages: {
            preferClassProperty: 'Property {{parameter}} should be declared as a class property.',
            preferParameterProperty: 'Property {{parameter}} should be declared as a parameter property.',
        },
        schema: [
            {
                type: 'object',
                $defs: {
                    modifier: {
                        type: 'string',
                        enum: [
                            'readonly',
                            'private',
                            'protected',
                            'public',
                            'private readonly',
                            'protected readonly',
                            'public readonly',
                        ],
                    },
                },
                additionalProperties: false,
                properties: {
                    allow: {
                        type: 'array',
                        description: 'Whether to allow certain kinds of properties to be ignored.',
                        items: {
                            $ref: '#/items/0/$defs/modifier',
                        },
                    },
                    prefer: {
                        type: 'string',
                        description: 'Whether to prefer class properties or parameter properties.',
                        enum: ['class-property', 'parameter-property'],
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            allow: [],
            prefer: 'class-property',
        },
    ],
    create(context, [{ allow = [], prefer = 'class-property' }]) {
        /**
         * Gets the modifiers of `node`.
         * @param node the node to be inspected.
         */
        function getModifiers(node) {
            const modifiers = [];
            if (node.accessibility) {
                modifiers.push(node.accessibility);
            }
            if (node.readonly) {
                modifiers.push('readonly');
            }
            return modifiers.filter(Boolean).join(' ');
        }
        if (prefer === 'class-property') {
            return {
                TSParameterProperty(node) {
                    const modifiers = getModifiers(node);
                    if (!allow.includes(modifiers)) {
                        // HAS to be an identifier or assignment or TSC will throw
                        if (node.parameter.type !== utils_1.AST_NODE_TYPES.Identifier &&
                            node.parameter.type !== utils_1.AST_NODE_TYPES.AssignmentPattern) {
                            return;
                        }
                        const name = node.parameter.type === utils_1.AST_NODE_TYPES.Identifier
                            ? node.parameter.name
                            : // has to be an Identifier or TSC will throw an error
                                node.parameter.left.name;
                        context.report({
                            node,
                            messageId: 'preferClassProperty',
                            data: {
                                parameter: name,
                            },
                        });
                    }
                },
            };
        }
        const propertyNodesByNameStack = [];
        function getNodesByName(name) {
            const propertyNodesByName = propertyNodesByNameStack[propertyNodesByNameStack.length - 1];
            const existing = propertyNodesByName.get(name);
            if (existing) {
                return existing;
            }
            const created = {};
            propertyNodesByName.set(name, created);
            return created;
        }
        function typeAnnotationsMatch(classProperty, constructorParameter) {
            if (!classProperty.typeAnnotation ||
                !constructorParameter.typeAnnotation) {
                return (classProperty.typeAnnotation === constructorParameter.typeAnnotation);
            }
            return (context.sourceCode.getText(classProperty.typeAnnotation) ===
                context.sourceCode.getText(constructorParameter.typeAnnotation));
        }
        return {
            ':matches(ClassDeclaration, ClassExpression):exit'() {
                const propertyNodesByName = (0, util_1.nullThrows)(propertyNodesByNameStack.pop(), 'Stack should exist on class exit');
                for (const [name, nodes] of propertyNodesByName) {
                    if (nodes.classProperty &&
                        nodes.constructorAssignment &&
                        nodes.constructorParameter &&
                        typeAnnotationsMatch(nodes.classProperty, nodes.constructorParameter)) {
                        context.report({
                            node: nodes.classProperty,
                            messageId: 'preferParameterProperty',
                            data: {
                                parameter: name,
                            },
                        });
                    }
                }
            },
            ClassBody(node) {
                for (const element of node.body) {
                    if (element.type === utils_1.AST_NODE_TYPES.PropertyDefinition &&
                        element.key.type === utils_1.AST_NODE_TYPES.Identifier &&
                        !element.value &&
                        !allow.includes(getModifiers(element))) {
                        getNodesByName(element.key.name).classProperty = element;
                    }
                }
            },
            'ClassDeclaration, ClassExpression'() {
                propertyNodesByNameStack.push(new Map());
            },
            'MethodDefinition[kind="constructor"]'(node) {
                for (const parameter of node.value.params) {
                    if (parameter.type === utils_1.AST_NODE_TYPES.Identifier) {
                        getNodesByName(parameter.name).constructorParameter = parameter;
                    }
                }
                for (const statement of node.value.body?.body ?? []) {
                    if (statement.type !== utils_1.AST_NODE_TYPES.ExpressionStatement ||
                        statement.expression.type !== utils_1.AST_NODE_TYPES.AssignmentExpression ||
                        statement.expression.left.type !==
                            utils_1.AST_NODE_TYPES.MemberExpression ||
                        statement.expression.left.object.type !==
                            utils_1.AST_NODE_TYPES.ThisExpression ||
                        statement.expression.left.property.type !==
                            utils_1.AST_NODE_TYPES.Identifier ||
                        statement.expression.right.type !== utils_1.AST_NODE_TYPES.Identifier) {
                        break;
                    }
                    getNodesByName(statement.expression.right.name).constructorAssignment = statement.expression;
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOptions = parseOptions;
const util_1 = require("../../util");
const enums_1 = require("./enums");
const shared_1 = require("./shared");
const validator_1 = require("./validator");
function normalizeOption(option) {
    let weight = 0;
    option.modifiers?.forEach(mod => {
        weight |= enums_1.Modifiers[mod];
    });
    option.types?.forEach(mod => {
        weight |= enums_1.TypeModifiers[mod];
    });
    // give selectors with a filter the _highest_ priority
    if (option.filter) {
        weight |= 1 << 30;
    }
    const normalizedOption = {
        // format options
        custom: option.custom
            ? {
                match: option.custom.match,
                regex: new RegExp(option.custom.regex, 'u'),
            }
            : null,
        filter: option.filter != null
            ? typeof option.filter === 'string'
                ? {
                    match: true,
                    regex: new RegExp(option.filter, 'u'),
                }
                : {
                    match: option.filter.match,
                    regex: new RegExp(option.filter.regex, 'u'),
                }
            : null,
        format: option.format ? option.format.map(f => enums_1.PredefinedFormats[f]) : null,
        leadingUnderscore: option.leadingUnderscore != null
            ? enums_1.UnderscoreOptions[option.leadingUnderscore]
            : null,
        modifiers: option.modifiers?.map(m => enums_1.Modifiers[m]) ?? null,
        prefix: option.prefix && option.prefix.length > 0 ? option.prefix : null,
        suffix: option.suffix && option.suffix.length > 0 ? option.suffix : null,
        trailingUnderscore: option.trailingUnderscore != null
            ? enums_1.UnderscoreOptions[option.trailingUnderscore]
            : null,
        types: option.types?.map(m => enums_1.TypeModifiers[m]) ?? null,
        // calculated ordering weight based on modifiers
        modifierWeight: weight,
    };
    const selectors = Array.isArray(option.selector)
        ? option.selector
        : [option.selector];
    return selectors.map(selector => ({
        selector: (0, shared_1.isMetaSelector)(selector)
            ? enums_1.MetaSelectors[selector]
            : enums_1.Selectors[selector],
        ...normalizedOption,
    }));
}
function parseOptions(context) {
    const normalizedOptions = context.options.flatMap(normalizeOption);
    return Object.fromEntries((0, util_1.getEnumNames)(enums_1.Selectors).map(k => [
        k,
        (0, validator_1.createValidator)(k, context, normalizedOptions),
    ]));
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-as-const',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce the use of `as const` over literal type',
            recommended: 'recommended',
        },
        fixable: 'code',
        hasSuggestions: true,
        messages: {
            preferConstAssertion: 'Expected a `const` instead of a literal type assertion.',
            variableConstAssertion: 'Expected a `const` assertion instead of a literal type annotation.',
            variableSuggest: 'You should use `as const` instead of type annotation.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        function compareTypes(valueNode, typeNode, canFix) {
            if (valueNode.type === utils_1.AST_NODE_TYPES.Literal &&
                typeNode.type === utils_1.AST_NODE_TYPES.TSLiteralType &&
                typeNode.literal.type === utils_1.AST_NODE_TYPES.Literal &&
                valueNode.raw === typeNode.literal.raw) {
                if (canFix) {
                    context.report({
                        node: typeNode,
                        messageId: 'preferConstAssertion',
                        fix: fixer => fixer.replaceText(typeNode, 'const'),
                    });
                }
                else {
                    context.report({
                        node: typeNode,
                        messageId: 'variableConstAssertion',
                        suggest: [
                            {
                                messageId: 'variableSuggest',
                                fix: (fixer) => [
                                    fixer.remove(typeNode.parent),
                                    fixer.insertTextAfter(valueNode, ' as const'),
                                ],
                            },
                        ],
                    });
                }
            }
        }
        return {
            PropertyDefinition(node) {
                if (node.value && node.typeAnnotation) {
                    compareTypes(node.value, node.typeAnnotation.typeAnnotation, false);
                }
            },
            TSAsExpression(node) {
                compareTypes(node.expression, node.typeAnnotation, true);
            },
            TSTypeAssertion(node) {
                compareTypes(node.expression, node.typeAnnotation, true);
            },
            VariableDeclarator(node) {
                if (node.init && node.id.typeAnnotation) {
                    compareTypes(node.init, node.id.typeAnnotation.typeAnnotation, false);
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const tsutils = __importStar(require("ts-api-utils"));
const util_1 = require("../util");
const getESLintCoreRule_1 = require("../util/getESLintCoreRule");
const baseRule = (0, getESLintCoreRule_1.getESLintCoreRule)('prefer-destructuring');
const destructuringTypeConfig = {
    type: 'object',
    additionalProperties: false,
    properties: {
        array: {
            type: 'boolean',
        },
        object: {
            type: 'boolean',
        },
    },
};
const schema = [
    {
        oneOf: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    AssignmentExpression: destructuringTypeConfig,
                    VariableDeclarator: destructuringTypeConfig,
                },
            },
            destructuringTypeConfig,
        ],
    },
    {
        type: 'object',
        properties: {
            enforceForDeclarationWithTypeAnnotation: {
                type: 'boolean',
                description: 'Whether to enforce destructuring on variable declarations with type annotations.',
            },
            enforceForRenamedProperties: {
                type: 'boolean',
                description: 'Whether to enforce destructuring that use a different variable name than the property name.',
            },
        },
    },
];
exports.default = (0, util_1.createRule)({
    name: 'prefer-destructuring',
    meta: {
        type: 'suggestion',
        // defaultOptions, -- base rule does not use defaultOptions
        docs: {
            description: 'Require destructuring from arrays and/or objects',
            extendsBaseRule: true,
            requiresTypeChecking: true,
        },
        fixable: baseRule.meta.fixable,
        hasSuggestions: baseRule.meta.hasSuggestions,
        messages: baseRule.meta.messages,
        schema,
    },
    defaultOptions: [
        {
            AssignmentExpression: {
                array: true,
                object: true,
            },
            VariableDeclarator: {
                array: true,
                object: true,
            },
        },
        {},
    ],
    create(context, [enabledTypes, options]) {
        const { enforceForDeclarationWithTypeAnnotation = false, enforceForRenamedProperties = false, } = options;
        const { esTreeNodeToTSNodeMap, program } = (0, util_1.getParserServices)(context);
        const typeChecker = program.getTypeChecker();
        const baseRules = baseRule.create(context);
        let baseRulesWithoutFixCache = null;
        return {
            AssignmentExpression(node) {
                if (node.operator !== '=') {
                    return;
                }
                performCheck(node.left, node.right, node);
            },
            VariableDeclarator(node) {
                performCheck(node.id, node.init, node);
            },
        };
        function performCheck(leftNode, rightNode, reportNode) {
            const rules = leftNode.type === utils_1.AST_NODE_TYPES.Identifier &&
                leftNode.typeAnnotation == null
                ? baseRules
                : baseRulesWithoutFix();
            if ((leftNode.type === utils_1.AST_NODE_TYPES.ArrayPattern ||
                leftNode.type === utils_1.AST_NODE_TYPES.Identifier ||
                leftNode.type === utils_1.AST_NODE_TYPES.ObjectPattern) &&
                leftNode.typeAnnotation != null &&
                !enforceForDeclarationWithTypeAnnotation) {
                return;
            }
            if (rightNode != null &&
                isArrayLiteralIntegerIndexAccess(rightNode) &&
                rightNode.object.type !== utils_1.AST_NODE_TYPES.Super) {
                const tsObj = esTreeNodeToTSNodeMap.get(rightNode.object);
                const objType = typeChecker.getTypeAtLocation(tsObj);
                if (!isTypeAnyOrIterableType(objType, typeChecker)) {
                    if (!enforceForRenamedProperties ||
                        !getNormalizedEnabledType(reportNode.type, 'object')) {
                        return;
                    }
                    context.report({
                        node: reportNode,
                        messageId: 'preferDestructuring',
                        data: { type: 'object' },
                    });
                    return;
                }
            }
            if (reportNode.type === utils_1.AST_NODE_TYPES.AssignmentExpression) {
                rules.AssignmentExpression(reportNode);
            }
            else {
                rules.VariableDeclarator(reportNode);
            }
        }
        function getNormalizedEnabledType(nodeType, destructuringType) {
            if ('object' in enabledTypes || 'array' in enabledTypes) {
                return enabledTypes[destructuringType];
            }
            return enabledTypes[nodeType][destructuringType];
        }
        function baseRulesWithoutFix() {
            baseRulesWithoutFixCache ??= baseRule.create(noFixContext(context));
            return baseRulesWithoutFixCache;
        }
    },
});
function noFixContext(context) {
    const customContext = {
        report: (descriptor) => {
            context.report({
                ...descriptor,
                fix: undefined,
            });
        },
    };
    // we can't directly proxy `context` because its `report` property is non-configurable
    // and non-writable. So we proxy `customContext` and redirect all
    // property access to the original context except for `report`
    return new Proxy(customContext, {
        get(target, path, receiver) {
            if (path !== 'report') {
                return Reflect.get(context, path, receiver);
            }
            return Reflect.get(target, path, receiver);
        },
    });
}
function isTypeAnyOrIterableType(type, typeChecker) {
    if ((0, util_1.isTypeAnyType)(type)) {
        return true;
    }
    if (!type.isUnion()) {
        const iterator = tsutils.getWellKnownSymbolPropertyOfType(type, 'iterator', typeChecker);
        return iterator != null;
    }
    return type.types.every(t => isTypeAnyOrIterableType(t, typeChecker));
}
function isArrayLiteralIntegerIndexAccess(node) {
    if (node.type !== utils_1.AST_NODE_TYPES.MemberExpression) {
        return false;
    }
    if (node.property.type !== utils_1.AST_NODE_TYPES.Literal) {
        return false;
    }
    return Number.isInteger(node.property.value);
}
                                                                                                                                                                                                                              "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-enum-initializers',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require each enum member value to be explicitly initialized',
        },
        hasSuggestions: true,
        messages: {
            defineInitializer: "The value of the member '{{ name }}' should be explicitly defined.",
            defineInitializerSuggestion: 'Can be fixed to {{ name }} = {{ suggested }}',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        function TSEnumDeclaration(node) {
            const { members } = node.body;
            members.forEach((member, index) => {
                if (member.initializer == null) {
                    const name = context.sourceCode.getText(member);
                    context.report({
                        node: member,
                        messageId: 'defineInitializer',
                        data: {
                            name,
                        },
                        suggest: [
                            {
                                messageId: 'defineInitializerSuggestion',
                                data: { name, suggested: index },
                                fix: (fixer) => {
                                    return fixer.replaceText(member, `${name} = ${index}`);
                                },
                            },
                            {
                                messageId: 'defineInitializerSuggestion',
                                data: { name, suggested: index + 1 },
                                fix: (fixer) => {
                                    return fixer.replaceText(member, `${name} = ${index + 1}`);
                                },
                            },
                            {
                                messageId: 'defineInitializerSuggestion',
                                data: { name, suggested: `'${name}'` },
                                fix: (fixer) => {
                                    return fixer.replaceText(member, `${name} = '${name}'`);
                                },
                            },
                        ],
                    });
                }
            });
        }
        return {
            TSEnumDeclaration,
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const tsutils = __importStar(require("ts-api-utils"));
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-find',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce the use of Array.prototype.find() over Array.prototype.filter() followed by [0] when looking for a single result',
            recommended: 'stylistic',
            requiresTypeChecking: true,
        },
        hasSuggestions: true,
        messages: {
            preferFind: 'Prefer .find(...) instead of .filter(...)[0].',
            preferFindSuggestion: 'Use .find(...) instead of .filter(...)[0].',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const globalScope = context.sourceCode.getScope(context.sourceCode.ast);
        const services = (0, util_1.getParserServices)(context);
        const checker = services.program.getTypeChecker();
        function parseArrayFilterExpressions(expression) {
            const node = (0, util_1.skipChainExpression)(expression);
            if (node.type === utils_1.AST_NODE_TYPES.SequenceExpression) {
                // Only the last expression in (a, b, [1, 2, 3].filter(condition))[0] matters
                const lastExpression = (0, util_1.nullThrows)(node.expressions.at(-1), 'Expected to have more than zero expressions in a sequence expression');
                return parseArrayFilterExpressions(lastExpression);
            }
            // This is the only reason we're returning a list rather than a single value.
            if (node.type === utils_1.AST_NODE_TYPES.ConditionalExpression) {
                // Both branches of the ternary _must_ return results.
                const consequentResult = parseArrayFilterExpressions(node.consequent);
                if (consequentResult.length === 0) {
                    return [];
                }
                const alternateResult = parseArrayFilterExpressions(node.alternate);
                if (alternateResult.length === 0) {
                    return [];
                }
                // Accumulate the results from both sides and pass up the chain.
                return [...consequentResult, ...alternateResult];
            }
            // Check if it looks like <<stuff>>(...), but not <<stuff>>?.(...)
            if (node.type === utils_1.AST_NODE_TYPES.CallExpression && !node.optional) {
                const callee = node.callee;
                // Check if it looks like <<stuff>>.filter(...) or <<stuff>>['filter'](...),
                // or the optional chaining variants.
                if (callee.type === utils_1.AST_NODE_TYPES.MemberExpression) {
                    const isBracketSyntaxForFilter = callee.computed;
                    if ((0, util_1.isStaticMemberAccessOfValue)(callee, context, 'filter')) {
                        const filterNode = callee.property;
                        const filteredObjectType = (0, util_1.getConstrainedTypeAtLocation)(services, callee.object);
                        // As long as the object is a (possibly nullable) array,
                        // this is an Array.prototype.filter expression.
                        if (isArrayish(filteredObjectType)) {
                            return [
                                {
                                    filterNode,
                                    isBracketSyntaxForFilter,
                                },
                            ];
                        }
                    }
                }
            }
            // not a filter expression.
            return [];
        }
        /**
         * Tells whether the type is a possibly nullable array/tuple or union thereof.
         */
        function isArrayish(type) {
            let isAtLeastOneArrayishComponent = false;
            for (const unionPart of tsutils.unionConstituents(type)) {
                if (tsutils.isIntrinsicNullType(unionPart) ||
                    tsutils.isIntrinsicUndefinedType(unionPart)) {
                    continue;
                }
                // apparently checker.isArrayType(T[] & S[]) => false.
                // so we need to check the intersection parts individually.
                const isArrayOrIntersectionThereof = tsutils
                    .intersectionConstituents(unionPart)
                    .every(intersectionPart => checker.isArrayType(intersectionPart) ||
                    checker.isTupleType(intersectionPart));
                if (!isArrayOrIntersectionThereof) {
                    // There is a non-array, non-nullish type component,
                    // so it's not an array.
                    return false;
                }
                isAtLeastOneArrayishComponent = true;
            }
            return isAtLeastOneArrayishComponent;
        }
        function getObjectIfArrayAtZeroExpression(node) {
            // .at() should take exactly one argument.
            if (node.arguments.length !== 1) {
                return undefined;
            }
            const callee = node.callee;
            if (callee.type === utils_1.AST_NODE_TYPES.MemberExpression &&
                !callee.optional &&
                (0, util_1.isStaticMemberAccessOfValue)(callee, context, 'at')) {
                const atArgument = (0, util_1.getStaticValue)(node.arguments[0], globalScope);
                if (atArgument != null && isTreatedAsZeroByArrayAt(atArgument.value)) {
                    return callee.object;
                }
            }
            return undefined;
        }
        /**
         * Implements the algorithm for array indexing by `.at()` method.
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at#parameters
         */
        function isTreatedAsZeroByArrayAt(value) {
            // This would cause the number constructor coercion to throw. Other static
            // values are safe.
            if (typeof value === 'symbol') {
                return false;
            }
            const asNumber = Number(value);
            if (isNaN(asNumber)) {
                return true;
            }
            return Math.trunc(asNumber) === 0;
        }
        function isMemberAccessOfZero(node) {
            const property = (0, util_1.getStaticValue)(node.property, globalScope);
            // Check if it looks like <<stuff>>[0] or <<stuff>>['0'], but not <<stuff>>?.[0]
            return (!node.optional &&
                property != null &&
                isTreatedAsZeroByMemberAccess(property.value));
        }
        /**
         * Implements the algorithm for array indexing by member operator.
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#array_indices
         */
        function isTreatedAsZeroByMemberAccess(value) {
            return String(value) === '0';
        }
        function generateFixToRemoveArrayElementAccess(fixer, arrayNode, wholeExpressionBeingFlagged) {
            const tokenToStartDeletingFrom = (0, util_1.nullThrows)(
            // The next `.` or `[` is what we're looking for.
            // think of (...).at(0) or (...)[0] or even (...)["at"](0).
            context.sourceCode.getTokenAfter(arrayNode, token => token.value === '.' || token.value === '['), 'Expected to find a member access token!');
            return fixer.removeRange([
                tokenToStartDeletingFrom.range[0],
                wholeExpressionBeingFlagged.range[1],
            ]);
        }
        function generateFixToReplaceFilterWithFind(fixer, filterExpression) {
            return fixer.replaceText(filterExpression.filterNode, filterExpression.isBracketSyntaxForFilter ? '"find"' : 'find');
        }
        return {
            // This query will be used to find things like `filteredResults.at(0)`.
            CallExpression(node) {
                const object = getObjectIfArrayAtZeroExpression(node);
                if (object) {
                    const filterExpressions = parseArrayFilterExpressions(object);
                    if (filterExpressions.length !== 0) {
                        context.report({
                            node,
                            messageId: 'preferFind',
                            suggest: [
                                {
                                    messageId: 'preferFindSuggestion',
                                    fix: (fixer) => {
                                        return [
                                            ...filterExpressions.map(filterExpression => generateFixToReplaceFilterWithFind(fixer, filterExpression)),
                                            // Get rid of the .at(0) or ['at'](0).
                                            generateFixToRemoveArrayElementAccess(fixer, object, node),
                                        ];
                                    },
                                },
                            ],
                        });
                    }
                }
            },
            // This query will be used to find things like `filteredResults[0]`.
            //
            // Note: we're always looking for array member access to be "computed",
            // i.e. `filteredResults[0]`, since `filteredResults.0` isn't a thing.
            'MemberExpression[computed=true]'(node) {
                if (isMemberAccessOfZero(node)) {
                    const object = node.object;
                    const filterExpressions = parseArrayFilterExpressions(object);
                    if (filterExpressions.length !== 0) {
                        context.report({
                            node,
                            messageId: 'preferFind',
                            suggest: [
                                {
                                    messageId: 'preferFindSuggestion',
                                    fix: (fixer) => {
                                        return [
                                            ...filterExpressions.map(filterExpression => generateFixToReplaceFilterWithFind(fixer, filterExpression)),
                                            // Get rid of the [0].
                                            generateFixToRemoveArrayElementAccess(fixer, object, node),
                                        ];
                                    },
                                },
                            ],
                        });
                    }
                }
            },
        };
    },
});
                                                                                                                                                                     "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-for-of',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce the use of `for-of` loop over the standard `for` loop where possible',
            recommended: 'stylistic',
        },
        messages: {
            preferForOf: 'Expected a `for-of` loop instead of a `for` loop with this simple iteration.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        function isSingleVariableDeclaration(node) {
            return (node?.type === utils_1.AST_NODE_TYPES.VariableDeclaration &&
                node.kind !== 'const' &&
                node.declarations.length === 1);
        }
        function isLiteral(node, value) {
            return node.type === utils_1.AST_NODE_TYPES.Literal && node.value === value;
        }
        function isZeroInitialized(node) {
            return node.init != null && isLiteral(node.init, 0);
        }
        function isMatchingIdentifier(node, name) {
            return node.type === utils_1.AST_NODE_TYPES.Identifier && node.name === name;
        }
        function isLessThanLengthExpression(node, name) {
            if (node?.type === utils_1.AST_NODE_TYPES.BinaryExpression &&
                node.operator === '<' &&
                isMatchingIdentifier(node.left, name) &&
                node.right.type === utils_1.AST_NODE_TYPES.MemberExpression &&
                isMatchingIdentifier(node.right.property, 'length')) {
                return node.right.object;
            }
            return null;
        }
        function isIncrement(node, name) {
            if (!node) {
                return false;
            }
            switch (node.type) {
                case utils_1.AST_NODE_TYPES.UpdateExpression:
                    // x++ or ++x
                    return (node.operator === '++' && isMatchingIdentifier(node.argument, name));
                case utils_1.AST_NODE_TYPES.AssignmentExpression:
                    if (isMatchingIdentifier(node.left, name)) {
                        if (node.operator === '+=') {
                            // x += 1
                            return isLiteral(node.right, 1);
                        }
                        if (node.operator === '=') {
                            // x = x + 1 or x = 1 + x
                            const expr = node.right;
                            return (expr.type === utils_1.AST_NODE_TYPES.BinaryExpression &&
                                expr.operator === '+' &&
                                ((isMatchingIdentifier(expr.left, name) &&
                                    isLiteral(expr.right, 1)) ||
                                    (isLiteral(expr.left, 1) &&
                                        isMatchingIdentifier(expr.right, name))));
                        }
                    }
            }
            return false;
        }
        function contains(outer, inner) {
            return (outer.range[0] <= inner.range[0] && outer.range[1] >= inner.range[1]);
        }
        function isIndexOnlyUsedWithArray(body, indexVar, arrayExpression) {
            const arrayText = context.sourceCode.getText(arrayExpression);
            return indexVar.references.every(reference => {
                const id = reference.identifier;
                const node = id.parent;
                return (!contains(body, id) ||
                    (node.type === utils_1.AST_NODE_TYPES.MemberExpression &&
                        node.object.type !== utils_1.AST_NODE_TYPES.ThisExpression &&
                        node.property === id &&
                        context.sourceCode.getText(node.object) === arrayText &&
                        !(0, util_1.isAssignee)(node)));
            });
        }
        return {
            'ForStatement:exit'(node) {
                if (!isSingleVariableDeclaration(node.init)) {
                    return;
                }
                const declarator = node.init.declarations[0];
                if (!declarator ||
                    !isZeroInitialized(declarator) ||
                    declarator.id.type !== utils_1.AST_NODE_TYPES.Identifier) {
                    return;
                }
                const indexName = declarator.id.name;
                const arrayExpression = isLessThanLengthExpression(node.test, indexName);
                if (!arrayExpression) {
                    return;
                }
                const [indexVar] = context.sourceCode.getDeclaredVariables(node.init);
                if (isIncrement(node.update, indexName) &&
                    isIndexOnlyUsedWithArray(node.body, indexVar, arrayExpression)) {
                    context.report({
                        node,
                        messageId: 'preferForOf',
                    });
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phrases = void 0;
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.phrases = {
    [utils_1.AST_NODE_TYPES.TSInterfaceDeclaration]: 'Interface',
    [utils_1.AST_NODE_TYPES.TSTypeLiteral]: 'Type literal',
};
exports.default = (0, util_1.createRule)({
    name: 'prefer-function-type',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce using function types instead of interfaces with call signatures',
            recommended: 'stylistic',
        },
        fixable: 'code',
        messages: {
            functionTypeOverCallableType: '{{ literalOrInterface }} only has a call signature, you should use a function type instead.',
            unexpectedThisOnFunctionOnlyInterface: "`this` refers to the function type '{{ interfaceName }}', did you intend to use a generic `this` parameter like `<Self>(this: Self, ...) => Self` instead?",
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        /**
         * Checks if there the interface has exactly one supertype that isn't named 'Function'
         * @param node The node being checked
         */
        function hasOneSupertype(node) {
            if (node.extends.length === 0) {
                return false;
            }
            if (node.extends.length !== 1) {
                return true;
            }
            const expr = node.extends[0].expression;
            return (expr.type !== utils_1.AST_NODE_TYPES.Identifier || expr.name !== 'Function');
        }
        /**
         * @param parent The parent of the call signature causing the diagnostic
         */
        function shouldWrapSuggestion(parent) {
            if (!parent) {
                return false;
            }
            switch (parent.type) {
                case utils_1.AST_NODE_TYPES.TSUnionType:
                case utils_1.AST_NODE_TYPES.TSIntersectionType:
                case utils_1.AST_NODE_TYPES.TSArrayType:
                    return true;
                default:
                    return false;
            }
        }
        /**
         * @param member The TypeElement being checked
         * @param node The parent of member being checked
         */
        function checkMember(member, node, tsThisTypes = null) {
            if ((member.type === utils_1.AST_NODE_TYPES.TSCallSignatureDeclaration ||
                member.type === utils_1.AST_NODE_TYPES.TSConstructSignatureDeclaration) &&
                member.returnType != null) {
                if (tsThisTypes?.length &&
                    node.type === utils_1.AST_NODE_TYPES.TSInterfaceDeclaration) {
                    // the message can be confusing if we don't point directly to the `this` node instead of the whole member
                    // and in favour of generating at most one error we'll only report the first occurrence of `this` if there are multiple
                    context.report({
                        node: tsThisTypes[0],
                        messageId: 'unexpectedThisOnFunctionOnlyInterface',
                        data: {
                            interfaceName: node.id.name,
                        },
                    });
                    return;
                }
                const fixable = node.parent.type === utils_1.AST_NODE_TYPES.ExportDefaultDeclaration;
                const fix = fixable
                    ? null
                    : (fixer) => {
                        const fixes = [];
                        const start = member.range[0];
                        // https://github.com/microsoft/TypeScript/pull/56908
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const colonPos = member.returnType.range[0] - start;
                        const text = context.sourceCode
                            .getText()
                            .slice(start, member.range[1]);
                        const comments = [
                            ...context.sourceCode.getCommentsBefore(member),
                            ...context.sourceCode.getCommentsAfter(member),
                        ];
                        let suggestion = `${text.slice(0, colonPos)} =>${text.slice(colonPos + 1)}`;
                        const lastChar = suggestion.endsWith(';') ? ';' : '';
                        if (lastChar) {
                            suggestion = suggestion.slice(0, -1);
                        }
                        if (shouldWrapSuggestion(node.parent)) {
                            suggestion = `(${suggestion})`;
                        }
                        if (node.type === utils_1.AST_NODE_TYPES.TSInterfaceDeclaration) {
                            if (node.typeParameters != null) {
                                suggestion = `type ${context.sourceCode
                                    .getText()
                                    .slice(node.id.range[0], node.typeParameters.range[1])} = ${suggestion}${lastChar}`;
                            }
                            else {
                                suggestion = `type ${node.id.name} = ${suggestion}${lastChar}`;
                            }
                        }
                        const isParentExported = node.parent.type === utils_1.AST_NODE_TYPES.ExportNamedDeclaration;
                        if (node.type === utils_1.AST_NODE_TYPES.TSInterfaceDeclaration &&
                            isParentExported) {
                            const commentsText = comments
                                .map(({ type, value }) => type === utils_1.AST_TOKEN_TYPES.Line
                                ? `//${value}\n`
                                : `/*${value}*/\n`)
                                .join('');
                            // comments should move before export and not between export and interface declaration
                            fixes.push(fixer.insertTextBefore(node.parent, commentsText));
                        }
                        else {
                            comments.forEach(comment => {
                                let commentText = comment.type === utils_1.AST_TOKEN_TYPES.Line
                                    ? `//${comment.value}`
                                    : `/*${comment.value}*/`;
                                const isCommentOnTheSameLine = comment.loc.start.line === member.loc.start.line;
                                if (!isCommentOnTheSameLine) {
                                    commentText += '\n';
                                }
                                else {
                                    commentText += ' ';
                                }
                                suggestion = commentText + suggestion;
                            });
                        }
                        const fixStart = node.range[0];
                        fixes.push(fixer.replaceTextRange([fixStart, node.range[1]], suggestion));
                        return fixes;
                    };
                context.report({
                    node: member,
                    messageId: 'functionTypeOverCallableType',
                    data: {
                        literalOrInterface: exports.phrases[node.type],
                    },
                    fix,
                });
            }
        }
        let tsThisTypes = null;
        let literalNesting = 0;
        return {
            TSInterfaceDeclaration() {
                // when entering an interface reset the count of `this`s to empty.
                tsThisTypes = [];
            },
            'TSInterfaceDeclaration:exit'(node) {
                if (!hasOneSupertype(node) && node.body.body.length === 1) {
                    checkMember(node.body.body[0], node, tsThisTypes);
                }
                // on exit check member and reset the array to nothing.
                tsThisTypes = null;
            },
            'TSInterfaceDeclaration TSThisType'(node) {
                // inside an interface keep track of all ThisType references.
                // unless it's inside a nested type literal in which case it's invalid code anyway
                // we don't want to incorrectly say "it refers to name" while typescript says it's completely invalid.
                if (literalNesting === 0 && tsThisTypes != null) {
                    tsThisTypes.push(node);
                }
            },
            // keep track of nested literals to avoid complaining about invalid `this` uses
            'TSInterfaceDeclaration TSTypeLiteral'() {
                literalNesting += 1;
            },
            'TSInterfaceDeclaration TSTypeLiteral:exit'() {
                literalNesting -= 1;
            },
            'TSTypeLiteral[members.length = 1]'(node) {
                checkMember(node.members[0], node);
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const regexpp_1 = require("@eslint-community/regexpp");
const utils_1 = require("@typescript-eslint/utils");
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-includes',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce `includes` method over `indexOf` method',
            recommended: 'stylistic',
            requiresTypeChecking: true,
        },
        fixable: 'code',
        messages: {
            preferIncludes: "Use 'includes()' method instead.",
            preferStringIncludes: 'Use `String#includes()` method with a string instead.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const globalScope = context.sourceCode.getScope(context.sourceCode.ast);
        const services = (0, util_1.getParserServices)(context);
        const checker = services.program.getTypeChecker();
        function isNumber(node, value) {
            const evaluated = (0, util_1.getStaticValue)(node, globalScope);
            return evaluated != null && evaluated.value === value;
        }
        function isPositiveCheck(node) {
            switch (node.operator) {
                case '!==':
                case '!=':
                case '>':
                    return isNumber(node.right, -1);
                case '>=':
                    return isNumber(node.right, 0);
                default:
                    return false;
            }
        }
        function isNegativeCheck(node) {
            switch (node.operator) {
                case '===':
                case '==':
                case '<=':
                    return isNumber(node.right, -1);
                case '<':
                    return isNumber(node.right, 0);
                default:
                    return false;
            }
        }
        function hasSameParameters(nodeA, nodeB) {
            if (!ts.isFunctionLike(nodeA) || !ts.isFunctionLike(nodeB)) {
                return false;
            }
            const paramsA = nodeA.parameters;
            const paramsB = nodeB.parameters;
            if (paramsA.length !== paramsB.length) {
                return false;
            }
            for (let i = 0; i < paramsA.length; ++i) {
                const paramA = paramsA[i];
                const paramB = paramsB[i];
                // Check name, type, and question token once.
                if (paramA.getText() !== paramB.getText()) {
                    return false;
                }
            }
            return true;
        }
        /**
         * Parse a given node if it's a `RegExp` instance.
         * @param node The node to parse.
         */
        function parseRegExp(node) {
            const evaluated = (0, util_1.getStaticValue)(node, globalScope);
            if (evaluated == null || !(evaluated.value instanceof RegExp)) {
                return null;
            }
            const { flags, pattern } = (0, regexpp_1.parseRegExpLiteral)(evaluated.value);
            if (pattern.alternatives.length !== 1 ||
                flags.ignoreCase ||
                flags.global) {
                return null;
            }
            // Check if it can determine a unique string.
            const chars = pattern.alternatives[0].elements;
            if (!chars.every(c => c.type === 'Character')) {
                return null;
            }
            // To string.
            return String.fromCodePoint(...chars.map(c => c.value));
        }
        function escapeString(str) {
            const EscapeMap = {
                '\0': '\\0',
                '\t': '\\t',
                '\n': '\\n',
                '\v': '\\v',
                '\f': '\\f',
                '\r': '\\r',
                "'": "\\'",
                '\\': '\\\\',
                // "\b" cause unexpected replacements
                // '\b': '\\b',
            };
            const replaceRegex = new RegExp(Object.values(EscapeMap).join('|'), 'g');
            return str.replaceAll(replaceRegex, char => EscapeMap[char]);
        }
        function checkArrayIndexOf(node, allowFixing) {
            if (!(0, util_1.isStaticMemberAccessOfValue)(node, context, 'indexOf')) {
                return;
            }
            // Check if the comparison is equivalent to `includes()`.
            const callNode = node.parent;
            const compareNode = (callNode.parent.type === utils_1.AST_NODE_TYPES.ChainExpression
                ? callNode.parent.parent
                : callNode.parent);
            const negative = isNegativeCheck(compareNode);
            if (!negative && !isPositiveCheck(compareNode)) {
                return;
            }
            // Get the symbol of `indexOf` method.
            const indexofMethodDeclarations = services
                .getSymbolAtLocation(node.property)
                ?.getDeclarations();
            if (indexofMethodDeclarations == null ||
                indexofMethodDeclarations.length === 0) {
                return;
            }
            // Check if every declaration of `indexOf` method has `includes` method
            // and the two methods have the same parameters.
            for (const instanceofMethodDecl of indexofMethodDeclarations) {
                const typeDecl = instanceofMethodDecl.parent;
                const type = checker.getTypeAtLocation(typeDecl);
                const includesMethodDecl = type
                    .getProperty('includes')
                    ?.getDeclarations();
                if (!includesMethodDecl?.some(includesMethodDecl => hasSameParameters(includesMethodDecl, instanceofMethodDecl))) {
                    return;
                }
            }
            // Report it.
            context.report({
                node: compareNode,
                messageId: 'preferIncludes',
                ...(allowFixing && {
                    *fix(fixer) {
                        if (negative) {
                            yield fixer.insertTextBefore(callNode, '!');
                        }
                        yield fixer.replaceText(node.property, 'includes');
                        yield fixer.removeRange([callNode.range[1], compareNode.range[1]]);
                    },
                }),
            });
        }
        return {
            // a.indexOf(b) !== 1
            'BinaryExpression > CallExpression.left > MemberExpression'(node) {
                checkArrayIndexOf(node, /* allowFixing */ true);
            },
            // a?.indexOf(b) !== 1
            'BinaryExpression > ChainExpression.left > CallExpression > MemberExpression'(node) {
                checkArrayIndexOf(node, /* allowFixing */ false);
            },
            // /bar/.test(foo)
            'CallExpression[arguments.length=1] > MemberExpression.callee[property.name="test"][computed=false]'(node) {
                const callNode = node.parent;
                const text = parseRegExp(node.object);
                if (text == null) {
                    return;
                }
                //check the argument type of test methods
                const argument = callNode.arguments[0];
                const type = (0, util_1.getConstrainedTypeAtLocation)(services, argument);
                const includesMethodDecl = type
                    .getProperty('includes')
                    ?.getDeclarations();
                if (includesMethodDecl == null) {
                    return;
                }
                context.report({
                    node: callNode,
                    messageId: 'preferStringIncludes',
                    *fix(fixer) {
                        const argNode = callNode.arguments[0];
                        const needsParen = argNode.type !== utils_1.AST_NODE_TYPES.Literal &&
                            argNode.type !== utils_1.AST_NODE_TYPES.TemplateLiteral &&
                            argNode.type !== utils_1.AST_NODE_TYPES.Identifier &&
                            argNode.type !== utils_1.AST_NODE_TYPES.MemberExpression &&
                            argNode.type !== utils_1.AST_NODE_TYPES.CallExpression;
                        yield fixer.removeRange([callNode.range[0], argNode.range[0]]);
                        yield fixer.removeRange([argNode.range[1], callNode.range[1]]);
                        if (needsParen) {
                            yield fixer.insertTextBefore(argNode, '(');
                            yield fixer.insertTextAfter(argNode, ')');
                        }
                        yield fixer.insertTextAfter(argNode, `${node.optional ? '?.' : '.'}includes('${escapeString(text)}')`);
                    },
                });
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-literal-enum-member',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require all enum members to be literal values',
            recommended: 'strict',
            requiresTypeChecking: false,
        },
        messages: {
            notLiteral: `Explicit enum value must only be a literal value (string or number).`,
            notLiteralOrBitwiseExpression: `Explicit enum value must only be a literal value (string or number) or a bitwise expression.`,
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    allowBitwiseExpressions: {
                        type: 'boolean',
                        description: 'Whether to allow using bitwise expressions in enum initializers.',
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            allowBitwiseExpressions: false,
        },
    ],
    create(context, [{ allowBitwiseExpressions }]) {
        function isIdentifierWithName(node, name) {
            return node.type === utils_1.AST_NODE_TYPES.Identifier && node.name === name;
        }
        function hasEnumMember(decl, name) {
            return decl.body.members.some(member => isIdentifierWithName(member.id, name) ||
                (member.id.type === utils_1.AST_NODE_TYPES.Literal &&
                    (0, util_1.getStaticStringValue)(member.id) === name));
        }
        function isSelfEnumMember(decl, node) {
            if (node.type === utils_1.AST_NODE_TYPES.Identifier) {
                return hasEnumMember(decl, node.name);
            }
            if (node.type === utils_1.AST_NODE_TYPES.MemberExpression &&
                isIdentifierWithName(node.object, decl.id.name)) {
                if (node.property.type === utils_1.AST_NODE_TYPES.Identifier) {
                    return hasEnumMember(decl, node.property.name);
                }
                if (node.computed) {
                    const propertyName = (0, util_1.getStaticStringValue)(node.property);
                    if (propertyName) {
                        return hasEnumMember(decl, propertyName);
                    }
                }
            }
            return false;
        }
        return {
            TSEnumMember(node) {
                // If there is no initializer, then this node is just the name of the member, so ignore.
                if (node.initializer == null) {
                    return;
                }
                const declaration = node.parent.parent;
                function isAllowedInitializerExpressionRecursive(node, partOfBitwiseComputation) {
                    // You can only refer to an enum member if it's part of a bitwise computation.
                    // so C = B isn't allowed (special case), but C = A | B is.
                    if (partOfBitwiseComputation && isSelfEnumMember(declaration, node)) {
                        return true;
                    }
                    switch (node.type) {
                        // any old literal
                        case utils_1.AST_NODE_TYPES.Literal:
                            return true;
                        // TemplateLiteral without expressions
                        case utils_1.AST_NODE_TYPES.TemplateLiteral:
                            return node.expressions.length === 0;
                        case utils_1.AST_NODE_TYPES.UnaryExpression:
                            // +123, -123, etc.
                            if (['-', '+'].includes(node.operator)) {
                                return isAllowedInitializerExpressionRecursive(node.argument, partOfBitwiseComputation);
                            }
                            if (allowBitwiseExpressions) {
                                return (node.operator === '~' &&
                                    isAllowedInitializerExpressionRecursive(node.argument, true));
                            }
                            return false;
                        case utils_1.AST_NODE_TYPES.BinaryExpression:
                            if (allowBitwiseExpressions) {
                                return (['&', '^', '<<', '>>', '>>>', '|'].includes(node.operator) &&
                                    isAllowedInitializerExpressionRecursive(node.left, true) &&
                                    isAllowedInitializerExpressionRecursive(node.right, true));
                            }
                            return false;
                        default:
                            return false;
                    }
                }
                if (isAllowedInitializerExpressionRecursive(node.initializer, false)) {
                    return;
                }
                context.report({
                    node: node.id,
                    messageId: allowBitwiseExpressions
                        ? 'notLiteralOrBitwiseExpression'
                        : 'notLiteral',
                });
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-namespace-keyword',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require using `namespace` keyword over `module` keyword to declare custom TypeScript modules',
            recommended: 'recommended',
        },
        fixable: 'code',
        messages: {
            useNamespace: "Use 'namespace' instead of 'module' to declare custom TypeScript modules.",
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        return {
            TSModuleDeclaration(node) {
                // Do nothing if the name is a string.
                if (node.id.type === utils_1.AST_NODE_TYPES.Literal) {
                    return;
                }
                // Get tokens of the declaration header.
                const moduleType = context.sourceCode.getTokenBefore(node.id);
                if (moduleType &&
                    moduleType.type === utils_1.AST_TOKEN_TYPES.Identifier &&
                    moduleType.value === 'module') {
                    context.report({
                        node,
                        messageId: 'useNamespace',
                        fix(fixer) {
                            return fixer.replaceText(moduleType, 'namespace');
                        },
                    });
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-readonly-parameter-types',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require function parameters to be typed as `readonly` to prevent accidental mutation of inputs',
            requiresTypeChecking: true,
        },
        messages: {
            shouldBeReadonly: 'Parameter should be a read only type.',
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    allow: {
                        ...util_1.readonlynessOptionsSchema.properties.allow,
                        description: 'An array of type specifiers to ignore.',
                    },
                    checkParameterProperties: {
                        type: 'boolean',
                        description: 'Whether to check class parameter properties.',
                    },
                    ignoreInferredTypes: {
                        type: 'boolean',
                        description: "Whether to ignore parameters which don't explicitly specify a type.",
                    },
                    treatMethodsAsReadonly: {
                        ...util_1.readonlynessOptionsSchema.properties.treatMethodsAsReadonly,
                        description: 'Whether to treat all mutable methods as though they are readonly.',
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            allow: util_1.readonlynessOptionsDefaults.allow,
            checkParameterProperties: true,
            ignoreInferredTypes: false,
            treatMethodsAsReadonly: util_1.readonlynessOptionsDefaults.treatMethodsAsReadonly,
        },
    ],
    create(context, [{ allow, checkParameterProperties, ignoreInferredTypes, treatMethodsAsReadonly, },]) {
        const services = (0, util_1.getParserServices)(context);
        return {
            [[
                utils_1.AST_NODE_TYPES.ArrowFunctionExpression,
                utils_1.AST_NODE_TYPES.FunctionDeclaration,
                utils_1.AST_NODE_TYPES.FunctionExpression,
                utils_1.AST_NODE_TYPES.TSCallSignatureDeclaration,
                utils_1.AST_NODE_TYPES.TSConstructSignatureDeclaration,
                utils_1.AST_NODE_TYPES.TSDeclareFunction,
                utils_1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
                utils_1.AST_NODE_TYPES.TSFunctionType,
                utils_1.AST_NODE_TYPES.TSMethodSignature,
            ].join(', ')](node) {
                for (const param of node.params) {
                    if (!checkParameterProperties &&
                        param.type === utils_1.AST_NODE_TYPES.TSParameterProperty) {
                        continue;
                    }
                    const actualParam = param.type === utils_1.AST_NODE_TYPES.TSParameterProperty
                        ? param.parameter
                        : param;
                    if (ignoreInferredTypes && actualParam.typeAnnotation == null) {
                        continue;
                    }
                    const type = services.getTypeAtLocation(actualParam);
                    const isReadOnly = (0, util_1.isTypeReadonly)(services.program, type, {
                        allow,
                        treatMethodsAsReadonly: !!treatMethodsAsReadonly,
                    });
                    if (!isReadOnly) {
                        context.report({
                            node: actualParam,
                            messageId: 'shouldBeReadonly',
                        });
                    }
                }
            },
        };
    },
});
                                                                                                                                                                                                "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
const analyzeChain_1 = require("./prefer-optional-chain-utils/analyzeChain");
const checkNullishAndReport_1 = require("./prefer-optional-chain-utils/checkNullishAndReport");
const gatherLogicalOperands_1 = require("./prefer-optional-chain-utils/gatherLogicalOperands");
exports.default = (0, util_1.createRule)({
    name: 'prefer-optional-chain',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce using concise optional chain expressions instead of chained logical ands, negated logical ors, or empty objects',
            recommended: 'stylistic',
            requiresTypeChecking: true,
        },
        fixable: 'code',
        hasSuggestions: true,
        messages: {
            optionalChainSuggest: 'Change to an optional chain.',
            preferOptionalChain: "Prefer using an optional chain expression instead, as it's more concise and easier to read.",
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: {
                        type: 'boolean',
                        description: 'Allow autofixers that will change the return type of the expression. This option is considered unsafe as it may break the build.',
                    },
                    checkAny: {
                        type: 'boolean',
                        description: 'Check operands that are typed as `any` when inspecting "loose boolean" operands.',
                    },
                    checkBigInt: {
                        type: 'boolean',
                        description: 'Check operands that are typed as `bigint` when inspecting "loose boolean" operands.',
                    },
                    checkBoolean: {
                        type: 'boolean',
                        description: 'Check operands that are typed as `boolean` when inspecting "loose boolean" operands.',
                    },
                    checkNumber: {
                        type: 'boolean',
                        description: 'Check operands that are typed as `number` when inspecting "loose boolean" operands.',
                    },
                    checkString: {
                        type: 'boolean',
                        description: 'Check operands that are typed as `string` when inspecting "loose boolean" operands.',
                    },
                    checkUnknown: {
                        type: 'boolean',
                        description: 'Check operands that are typed as `unknown` when inspecting "loose boolean" operands.',
                    },
                    requireNullish: {
                        type: 'boolean',
                        description: 'Skip operands that are not typed with `null` and/or `undefined` when inspecting "loose boolean" operands.',
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false,
            checkAny: true,
            checkBigInt: true,
            checkBoolean: true,
            checkNumber: true,
            checkString: true,
            checkUnknown: true,
            requireNullish: false,
        },
    ],
    create(context, [options]) {
        const parserServices = (0, util_1.getParserServices)(context);
        const seenLogicals = new Set();
        return {
            // specific handling for `(foo ?? {}).bar` / `(foo || {}).bar`
            'LogicalExpression[operator!="??"]'(node) {
                if (seenLogicals.has(node)) {
                    return;
                }
                const { newlySeenLogicals, operands } = (0, gatherLogicalOperands_1.gatherLogicalOperands)(node, parserServices, context.sourceCode, options);
                for (const logical of newlySeenLogicals) {
                    seenLogicals.add(logical);
                }
                let currentChain = [];
                for (const operand of operands) {
                    if (operand.type === gatherLogicalOperands_1.OperandValidity.Invalid) {
                        (0, analyzeChain_1.analyzeChain)(context, parserServices, options, node, node.operator, currentChain);
                        currentChain = [];
                    }
                    else {
                        currentChain.push(operand);
                    }
                }
                // make sure to check whatever's left
                if (currentChain.length > 0) {
                    (0, analyzeChain_1.analyzeChain)(context, parserServices, options, node, node.operator, currentChain);
                }
            },
            'LogicalExpression[operator="||"], LogicalExpression[operator="??"]'(node) {
                const leftNode = node.left;
                const rightNode = node.right;
                const parentNode = node.parent;
                const isRightNodeAnEmptyObjectLiteral = rightNode.type === utils_1.AST_NODE_TYPES.ObjectExpression &&
                    rightNode.properties.length === 0;
                if (!isRightNodeAnEmptyObjectLiteral ||
                    parentNode.type !== utils_1.AST_NODE_TYPES.MemberExpression ||
                    parentNode.optional) {
                    return;
                }
                seenLogicals.add(node);
                function isLeftSideLowerPrecedence() {
                    const logicalTsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
                    const leftTsNode = parserServices.esTreeNodeToTSNodeMap.get(leftNode);
                    const leftPrecedence = (0, util_1.getOperatorPrecedence)(leftTsNode.kind, logicalTsNode.operatorToken.kind);
                    return leftPrecedence < util_1.OperatorPrecedence.LeftHandSide;
                }
                (0, checkNullishAndReport_1.checkNullishAndReport)(context, parserServices, options, [leftNode], {
                    node: parentNode,
                    messageId: 'preferOptionalChain',
                    suggest: [
                        {
                            messageId: 'optionalChainSuggest',
                            fix: (fixer) => {
                                const leftNodeText = context.sourceCode.getText(leftNode);
                                // Any node that is made of an operator with higher or equal precedence,
                                const maybeWrappedLeftNode = isLeftSideLowerPrecedence()
                                    ? `(${leftNodeText})`
                                    : leftNodeText;
                                const propertyToBeOptionalText = context.sourceCode.getText(parentNode.property);
                                const maybeWrappedProperty = parentNode.computed
                                    ? `[${propertyToBeOptionalText}]`
                                    : propertyToBeOptionalText;
                                return fixer.replaceTextRange(parentNode.range, `${maybeWrappedLeftNode}?.${maybeWrappedProperty}`);
                            },
                        },
                    ],
                });
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-promise-reject-errors',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require using Error objects as Promise rejection reasons',
            extendsBaseRule: true,
            recommended: 'recommended',
            requiresTypeChecking: true,
        },
        messages: {
            rejectAnError: 'Expected the Promise rejection reason to be an Error.',
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    allowEmptyReject: {
                        type: 'boolean',
                        description: 'Whether to allow calls to `Promise.reject()` with no arguments.',
                    },
                    allowThrowingAny: {
                        type: 'boolean',
                        description: 'Whether to always allow throwing values typed as `any`.',
                    },
                    allowThrowingUnknown: {
                        type: 'boolean',
                        description: 'Whether to always allow throwing values typed as `unknown`.',
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            allowEmptyReject: false,
            allowThrowingAny: false,
            allowThrowingUnknown: false,
        },
    ],
    create(context, [options]) {
        const services = (0, util_1.getParserServices)(context);
        function checkRejectCall(callExpression) {
            const argument = callExpression.arguments.at(0);
            if (argument) {
                const type = services.getTypeAtLocation(argument);
                if (options.allowThrowingAny && (0, util_1.isTypeAnyType)(type)) {
                    return;
                }
                if (options.allowThrowingUnknown && (0, util_1.isTypeUnknownType)(type)) {
                    return;
                }
                if ((0, util_1.isErrorLike)(services.program, type) ||
                    (0, util_1.isReadonlyErrorLike)(services.program, type)) {
                    return;
                }
            }
            else if (options.allowEmptyReject) {
                return;
            }
            context.report({
                node: callExpression,
                messageId: 'rejectAnError',
            });
        }
        function typeAtLocationIsLikePromise(node) {
            const type = services.getTypeAtLocation(node);
            return ((0, util_1.isPromiseConstructorLike)(services.program, type) ||
                (0, util_1.isPromiseLike)(services.program, type));
        }
        return {
            CallExpression(node) {
                const callee = (0, util_1.skipChainExpression)(node.callee);
                if (callee.type !== utils_1.AST_NODE_TYPES.MemberExpression) {
                    return;
                }
                if (!(0, util_1.isStaticMemberAccessOfValue)(callee, context, 'reject') ||
                    !typeAtLocationIsLikePromise(callee.object)) {
                    return;
                }
                checkRejectCall(node);
            },
            NewExpression(node) {
                const callee = (0, util_1.skipChainExpression)(node.callee);
                if (!(0, util_1.isPromiseConstructorLike)(services.program, services.getTypeAtLocation(callee))) {
                    return;
                }
                const executor = node.arguments.at(0);
                if (!executor || !(0, util_1.isFunction)(executor)) {
                    return;
                }
                const rejectParamNode = executor.params.at(1);
                if (!rejectParamNode || !(0, util_1.isIdentifier)(rejectParamNode)) {
                    return;
                }
                // reject param is always present in variables declared by executor
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const rejectVariable = context.sourceCode
                    .getDeclaredVariables(executor)
                    .find(variable => variable.identifiers.includes(rejectParamNode));
                rejectVariable.references.forEach(ref => {
                    if (ref.identifier.parent.type !== utils_1.AST_NODE_TYPES.CallExpression ||
                        ref.identifier !== ref.identifier.parent.callee) {
                        return;
                    }
                    checkRejectCall(ref.identifier.parent);
                });
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const tsutils = __importStar(require("ts-api-utils"));
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-reduce-type-parameter',
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce using type parameter when calling `Array#reduce` instead of using a type assertion',
            recommended: 'strict',
            requiresTypeChecking: true,
        },
        fixable: 'code',
        messages: {
            preferTypeParameter: 'Unnecessary assertion: Array#reduce accepts a type parameter for the default value.',
        },
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        const services = (0, util_1.getParserServices)(context);
        const checker = services.program.getTypeChecker();
        function isArrayType(type) {
            return tsutils
                .unionConstituents(type)
                .every(unionPart => tsutils
                .intersectionConstituents(unionPart)
                .every(t => checker.isArrayType(t) || checker.isTupleType(t)));
        }
        return {
            'CallExpression > MemberExpression.callee'(callee) {
                if (!(0, util_1.isStaticMemberAccessOfValue)(callee, context, 'reduce')) {
                    return;
                }
                const [, secondArg] = callee.parent.arguments;
                if (callee.parent.arguments.length < 2) {
                    return;
                }
                if ((0, util_1.isTypeAssertion)(secondArg)) {
                    const initializerType = services.getTypeAtLocation(secondArg.expression);
                    const assertedType = services.getTypeAtLocation(secondArg.typeAnnotation);
                    const isAssertionNecessary = !checker.isTypeAssignableTo(initializerType, assertedType);
                    // don't report this if the resulting fix will be a type error
                    if (isAssertionNecessary) {
                        return;
                    }
                }
                else {
                    return;
                }
                // Get the symbol of the `reduce` method.
                const calleeObjType = (0, util_1.getConstrainedTypeAtLocation)(services, callee.object);
                // Check the owner type of the `reduce` method.
                if (isArrayType(calleeObjType)) {
                    context.report({
                        node: secondArg,
                        messageId: 'preferTypeParameter',
                        fix: fixer => {
                            const fixes = [
                                fixer.removeRange([
                                    secondArg.range[0],
                                    secondArg.expression.range[0],
                                ]),
                                fixer.removeRange([
                                    secondArg.expression.range[1],
                                    secondArg.range[1],
                                ]),
                            ];
                            if (!callee.parent.typeArguments) {
                                fixes.push(fixer.insertTextAfter(callee, `<${context.sourceCode.getText(secondArg.typeAnnotation)}>`));
                            }
                            return fixes;
                        },
                    });
                    return;
                }
            },
        };
    },
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
const getWrappedCode_1 = require("../util/getWrappedCode");
const isMemberAccessLike = (0, util_1.isNodeOfTypes)([
    utils_1.AST_NODE_TYPES.ChainExpression,
    utils_1.AST_NODE_TYPES.Identifier,
    utils_1.AST_NODE_TYPES.MemberExpression,
]);
const isNullLiteralOrUndefinedIdentifier = (node) => (0, util_1.isNullLiteral)(node) || (0, util_1.isUndefinedIdentifier)(node);
const isNodeNullishComparison = (node) => isNullLiteralOrUndefinedIdentifier(node.left) &&
    isNullLiteralOrUndefinedIdentifier(node.right);
exports.default = (0, util_1.createRule)({
    name: 'prefer-nullish-coalescing',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce using the nullish coalescing operator instead of logical assignments or chaining',
            recommended: 'stylistic',
            requiresTypeChecking: true,
        },
        hasSuggestions: true,
        messages: {
            noStrictNullCheck: 'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
            preferNullishOverAssignment: 'Prefer using nullish coalescing operator (`??{{ equals }}`) instead of an assignment expression, as it is simpler to read.',
            preferNullishOverOr: 'Prefer using nullish coalescing operator (`??{{ equals }}`) instead of a logical {{ description }} (`||{{ equals }}`), as it is a safer operator.',
            preferNullishOverTernary: 'Prefer using nullish coalescing operator (`??{{ equals }}`) instead of a ternary expression, as it is simpler to read.',
            suggestNullish: 'Fix to nullish coalescing operator (`??{{ equals }}`).',
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
                        type: 'boolean',
                        description: 'Unless this is set to `true`, the rule will error on every file whose `tsconfig.json` does _not_ have the `strictNullChecks` compiler option (or `strict`) set to `true`.',
                    },
                    ignoreBooleanCoercion: {
                        type: 'boolean',
                        description: 'Whether to ignore arguments to the `Boolean` constructor',
                    },
                    ignoreConditionalTests: {
                        type: 'boolean',
                        description: 'Whether to ignore cases that are located within a conditional test.',
                    },
                    ignoreIfStatements: {
                        type: 'boolean',
                        description: 'Whether to ignore any if statements that could be simplified by using the nullish coalescing operator.',
                    },
                    ignoreMixedLogicalExpressions: {
                        type: 'boolean',
                        description: 'Whether to ignore any logical or expressions that are part of a mixed logical expression (with `&&`).',
                    },
                    ignorePrimitives: {
                        description: 'Whether to ignore all (`true`) or some (an object with properties) primitive types.',
                        oneOf: [
                            {
                                type: 'object',
                                description: 'Which primitives types may be ignored.',
                                properties: {
                                    bigint: {
                                        type: 'boolean',
                                        description: 'Ignore bigint primitive types.',
                                    },
                                    boolean: {
                                        type: 'boolean',
                                        description: 'Ignore boolean primitive types.',
                                    },
                                    number: {
                                        type: 'boolean',
                                        description: 'Ignore number primitive types.',
                                    },
                                    string: {
                                        type: 'boolean',
                                        description: 'Ignore string primitive types.',
                                    },
                                },
                            },
                            {
                                type: 'boolean',
                                description: 'Ignore all primitive types.',
                                enum: [true],
                            },
                        ],
                    },
                    ignoreTernaryTests: {
                        type: 'boolean',
                        description: 'Whether to ignore any ternary expressions that could be simplified by using the nullish coalescing operator.',
                    },
                },
            },
        ],
    },
    defaultOptions: [
        {
            allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
            ignoreBooleanCoercion: false,
            ignoreConditionalTests: true,
            ignoreIfStatements: false,
            ignoreMixedLogicalExpressions: false,
            ignorePrimitives: {
                bigint: false,
                boolean: false,
                number: false,
                string: false,
            },
            ignoreTernaryTests: false,
        },
    ],
    create(context, [{ allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing, ignoreBooleanCoercion, ignoreConditionalTests, ignoreIfStatements, ignoreMixedLogicalExpressions, ignorePrimitives, ignoreTernaryTests, },]) {
        const parserServices = (0, util_1.getParserServices)(context);
        const compilerOptions = parserServices.program.getCompilerOptions();
        const isStrictNullChecks = tsutils.isStrictCompilerOptionEnabled(compilerOptions, 'strictNullChecks');
        if (!isStrictNullChecks &&
            allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing !== true) {
            context.report({
                loc: {
                    start: { column: 0, line: 0 },
                    end: { column: 0, line: 0 },
                },
                messageId: 'noStrictNullCheck',
            });
        }
        /**
         * Checks whether a type tested for truthiness is eligible for conversion to
         * a nullishness check, taking into account the rule's configuration.
         */
        function isTypeEligibleForPreferNullish(type) {
            if (!(0, util_1.isNullableType)(type)) {
                return false;
            }
            const ignorableFlags = [
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                (ignorePrimitives === true || ignorePrimitives.bigint) &&
                    ts.TypeFlags.BigIntLike,
                (ignorePrimitives === true || ignorePrimitives.boolean) &&
                    ts.TypeFlags.BooleanLike,
                (ignorePrimitives === true || ignorePrimitives.number) &&
                    ts.TypeFlags.NumberLike,
                (ignorePrimitives === true || ignorePrimitives.string) &&
                    ts.TypeFlags.StringLike,
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
            ]
                .filter((flag) => typeof flag === 'number')
                .reduce((previous, flag) => previous | flag, 0);
            if (ignorableFlags === 0) {
                // any types are eligible for conversion.
                return true;
            }
            // if the type is `any` or `unknown` we can't make any assumptions
            // about the value, so it could be any primitive, even though the flags
            // won't be set.
            //
            // technically, this is true of `void` as well, however, it's a TS error
            // to test `void` for truthiness, so we don't need to bother checking for
            // it in valid code.
            if (tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
                return false;
            }
            if (tsutils
                .typeConstituents(type)
                .some(t => tsutils
                .intersectionConstituents(t)
                .some(t => tsutils.isTypeFlagSet(t, ignorableFlags)))) {
                return false;
            }
            return true;
        }
        /**
         * Determines whether a control flow construct that uses the truthiness of
         * a test expression is eligible for conversion to the nullish coalescing
         * operator, taking into account (both dependent on the rule's configuration):
         * 1. Whether the construct is in a permitted syntactic context
         * 2. Whether the type of the test expression is deemed eligible for
         *    conversion
         *
         * @param node The overall node to be converted (e.g. `a || b` or `a ? a : b`)
         * @param testNode The node being tested (i.e. `a`)
         */
        function isTruthinessCheckEligibleForPreferNullish({ node, testNode, }) {
            const testType = parserServices.getTypeAtLocation(testNode);
            if (!isTypeEligibleForPreferNullish(testType)) {
                return false;
            }
            if (ignoreConditionalTests === true && isConditionalTest(node)) {
                return false;
            }
            if (ignoreBooleanCoercion === true &&
                isBooleanConstructorContext(node, context)) {
                return false;
            }
            return true;
        }
        function checkAndFixWithPreferNullishOverOr(node, description, equals) {
            if (!isTruthinessCheckEligibleForPreferNullish({
                node,
                testNode: node.left,
            })) {
                return;
            }
            if (ignoreMixedLogicalExpressions === true &&
                isMixedLogicalExpression(node)) {
                return;
            }
            const barBarOperator = (0, util_1.nullThrows)(context.sourceCode.getTokenAfter(node.left, token => token.type === utils_1.AST_TOKEN_TYPES.Punctuator &&
                token.value === node.operator), util_1.NullThrowsReasons.MissingToken('operator', node.type));
            function* fix(fixer) {
                if ((0, util_1.isLogicalOrOperator)(node.parent)) {
                    // '&&' and '??' operations cannot be mixed without parentheses (e.g. a && b ?? c)
                    if (node.left.type === utils_1.AST_NODE_TYPES.LogicalExpression &&
                        !(0, util_1.isLogicalOrOperator)(node.left.left)) {
                        yield fixer.insertTextBefore(node.left.right, '(');
                    }
                    else {
                        yield fixer.insertTextBefore(node.left, '(');
                    }
                    yield fixer.insertTextAfter(node.right, ')');
                }
                yield fixer.replaceText(barBarOperator, node.operator.replace('||', '??'));
            }
            context.report({
                node: barBarOperator,
                messageId: 'preferNullishOverOr',
                data: { description, equals },
                suggest: [
                    {
                        messageId: 'suggestNullish',
                        data: { equals },
                        fix,
                    },
                ],
            });
        }
        function getNullishCoalescingParams(node, nonNullishNode, nodesInsideTestExpression, operator) {
            let nullishCoalescingLeftNode;
            let hasTruthinessCheck = false;
            let hasNullCheckWithoutTruthinessCheck = false;
            let hasUndefinedCheckWithoutTruthinessCheck = false;
            if (!nodesInsideTestExpression.length) {
                hasTruthinessCheck = true;
                nullishCoalescingLeftNode =
                    node.test.type === utils_1.AST_NODE_TYPES.UnaryExpression
                        ? node.test.argument
                        : node.test;
                if (!areNodesSimilarMemberAccess(nullishCoalescingLeftNode, nonNullishNode)) {
                    return { isFixable: false };
                }
            }
            else {
                // we check that the test only contains null, undefined and the identifier
                for (const testNode of nodesInsideTestExpression) {
                    if ((0, util_1.isNullLiteral)(testNode)) {
                        hasNullCheckWithoutTruthinessCheck = true;
                    }
                    else if ((0, util_1.isUndefinedIdentifier)(testNode)) {
                        hasUndefinedCheckWithoutTruthinessCheck = true;
                    }
                    else if (areNodesSimilarMemberAccess(testNode, nonNullishNode)) {
                        // Only consider the first expression in a multi-part nullish check,
                        // as subsequent expressions might not require all the optional chaining operators.
                        // For example: a?.b?.c !== undefined && a.b.c !== null ? a.b.c : 'foo';
                        // This works because `node.test` is always evaluated first in the loop
                        // and has the same or more necessary optional chaining operators
                        // than `node.alternate` or `node.consequent`.
                        nullishCoalescingLeftNode ??= testNode;
                    }
                    else {
                        return { isFixable: false };
                    }
                }
            }
            if (!nullishCoalescingLeftNode) {
                return { isFixable: false };
            }
            const isFixable = (() => {
                if (hasTruthinessCheck) {
                    return isTruthinessCheckEligibleForPreferNullish({
                        node,
                        testNode: nullishCoalescingLeftNode,
                    });
                }
                // it is fixable if we check for both null and undefined, or not if neither
                if (hasUndefinedCheckWithoutTruthinessCheck ===
                    hasNullCheckWithoutTruthinessCheck) {
                    return hasUndefinedCheckWithoutTruthinessCheck;
                }
                // it is fixable if we loosely check for either null or undefined
                if (['==', '!='].includes(operator)) {
                    return true;
                }
                const type = parserServices.getTypeAtLocation(nullishCoalescingLeftNode);
                const flags = (0, util_1.getTypeFlags)(type);
                if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
                    return false;
                }
                const hasNullType = (flags & ts.TypeFlags.Null) !== 0;
                // it is fixable if we check for undefined and the type is not nullable
                if (hasUndefinedCheckWithoutTruthinessCheck && !hasNullType) {
                    return true;
                }
                const hasUndefinedType = (flags & ts.TypeFlags.Undefined) !== 0;
                // it is fixable if we check for null and the type can't be undefined
                return hasNullCheckWithoutTruthinessCheck && !hasUndefinedType;
            })();
            return isFixable
                ? { isFixable: true, nullishCoalescingLeftNode }
                : { isFixable: false };
        }
        return {
            'AssignmentExpression[operator = "||="]'(node) {
                checkAndFixWithPreferNullishOverOr(node, 'assignment', '=');
            },
            ConditionalExpression(node) {
                if (ignoreTernaryTests) {
                    return;
                }
                const { nodesInsideTestExpression, operator } = getOperatorAndNodesInsideTestExpression(node);
                if (operator == null) {
                    return;
                }
                const { nonNullishBranch, nullishBranch } = getBranchNodes(node, operator);
                const nullishCoalescingParams = getNullishCoalescingParams(node, nonNullishBranch, nodesInsideTestExpression, operator);
                if (nullishCoalescingParams.isFixable) {
                    context.report({
                        node,
                        messageId: 'preferNullishOverTernary',
                        // TODO: also account for = in the ternary clause
                        data: { equals: '' },
                        suggest: [
                            {
                                messageId: 'suggestNullish',
                                data: { equals: '' },
                                fix(fixer) {
                                    const nullishBranchText = (0, util_1.getTextWithParentheses)(context.sourceCode, nullishBranch);
                                    const rightOperandReplacement = (0, util_1.isParenthesized)(nullishBranch, context.sourceCode)
                                        ? nullishBranchText
                                        : (0, getWrappedCode_1.getWrappedCode)(nullishBranchText, (0, util_1.getOperatorPrecedenceForNode)(nullishBranch), util_1.OperatorPrecedence.Coalesce);
                                    return fixer.replaceText(node, `${(0, util_1.getTextWithParentheses)(context.sourceCode, nullishCoalescingParams.nullishCoalescingLeftNode)} ?? ${rightOperandReplacement}`);
                                },
                            },
                        ],
                    });
                }
            },
            IfStatement(node) {
                if (ignoreIfStatements || node.alternate != null) {
                    return;
                }
                let assignmentExpression;
                if (node.consequent.type === utils_1.AST_NODE_TYPES.BlockStatement &&
                    node.consequent.body.length === 1 &&
                    node.consequent.body[0].type === utils_1.AST_NODE_TYPES.ExpressionStatement) {
                    assignmentExpression = node.consequent.body[0].expression;
                }
                else if (node.consequent.type === utils_1.AST_NODE_TYPES.ExpressionStatement) {
                    assignmentExpression = node.consequent.expression;
                }
                if (!assignmentExpression ||
                    assignmentExpression.type !== utils_1.AST_NODE_TYPES.AssignmentExpression ||
                    !isMemberAccessLike(assignmentExpression.left)) {
                    return;
                }
                const nullishCoalescingLeftNode = assignmentExpression.left;
                const nullishCoalescingRightNode = assignmentExpression.right;
                const { nodesInsideTestExpression, operator } = getOperatorAndNodesInsideTestExpression(node);
                if (operator == null || !['!', '==', '==='].includes(operator)) {
                    return;
                }
                const nullishCoalescingParams = getNullishCoalescingParams(node, nullishCoalescingLeftNode, nodesInsideTestExpression, operator);
                if (nullishCoalescingParams.isFixable) {
                    // Handle comments
                    const isConsequentNodeBlockStatement = node.consequent.type === utils_1.AST_NODE_TYPES.BlockStatement;
                    const commentsBefore = formatComments(context.sourceCode.getCommentsBefore(assignmentExpression), isConsequentNodeBlockStatement ? '\n' : ' ');
                    const commentsAfter = isConsequentNodeBlockStatement
                        ? formatComments(context.sourceCode.getCommentsAfter(assignmentExpression.parent), '\n')
                        : '';
                    context.report({
                        node,
                        messageId: 'preferNullishOverAssignment',
                        data: { equals: '=' },
                        suggest: [
                            {
                                messageId: 'suggestNullish',
                                data: { equals: '=' },
                                fix(fixer) {
                                    const fixes = [];
                                    if (commentsBefore) {
                                        fixes.push(fixer.insertTextBefore(node, commentsBefore));
                                    }
                                    fixes.push(fixer.replaceText(node, `${(0, util_1.getTextWithParentheses)(context.sourceCode, nullishCoalescingLeftNode)} ??= ${(0, util_1.getTextWithParentheses)(context.sourceCode, nullishCoalescingRightNode)};`));
                                    if (commentsAfter) {
                                        fixes.push(fixer.insertTextAfter(node, ` ${commentsAfter.slice(0, -1)}`));
                                    }
                                    return fixes;
                                },
                            },
                        ],
                    });
                }
            },
            'LogicalExpression[operator = "||"]'(node) {
                checkAndFixWithPreferNullishOverOr(node, 'or', '');
            },
        };
    },
});
function isConditionalTest(node) {
    const parent = node.parent;
    if (parent == null) {
        return false;
    }
    if (parent.type === utils_1.AST_NODE_TYPES.LogicalExpression) {
        return isConditionalTest(parent);
    }
    if (parent.type === utils_1.AST_NODE_TYPES.ConditionalExpression &&
        (parent.consequent === node || parent.alternate === node)) {
        return isConditionalTest(parent);
    }
    if (parent.type === utils_1.AST_NODE_TYPES.SequenceExpression &&
        parent.expressions.at(-1) === node) {
        return isConditionalTest(parent);
    }
    if (parent.type === utils_1.AST_NODE_TYPES.UnaryExpression &&
        parent.operator === '!') {
        return isConditionalTest(parent);
    }
    if ((parent.type === utils_1.AST_NODE_TYPES.ConditionalExpression ||
        parent.type === utils_1.AST_NODE_TYPES.DoWhileStatement ||
        parent.type === utils_1.AST_NODE_TYPES.IfStatement ||
        parent.type === utils_1.AST_NODE_TYPES.ForStatement ||
        parent.type === utils_1.AST_NODE_TYPES.WhileStatement) &&
        parent.test === node) {
        return true;
    }
    return false;
}
function isBooleanConstructorContext(node, context) {
    const parent = node.parent;
    if (parent == null) {
        return false;
    }
    if (parent.type === utils_1.AST_NODE_TYPES.LogicalExpression) {
        return isBooleanConstructorContext(parent, context);
    }
    if (parent.type === utils_1.AST_NODE_TYPES.ConditionalExpression &&
        (parent.consequent === node || parent.alternate === node)) {
        return isBooleanConstructorContext(parent, context);
    }
    if (parent.type === utils_1.AST_NODE_TYPES.SequenceExpression &&
        parent.expressions.at(-1) === node) {
        return isBooleanConstructorContext(parent, context);
    }
    return isBuiltInBooleanCall(parent, context);
}
function isBuiltInBooleanCall(node, context) {
    if (node.type === utils_1.AST_NODE_TYPES.CallExpression &&
        node.callee.type === utils_1.AST_NODE_TYPES.Identifier &&
        // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
        node.callee.name === 'Boolean' &&
        node.arguments[0]) {
        const scope = context.sourceCode.getScope(node);
        const variable = scope.set.get(utils_1.AST_TOKEN_TYPES.Boolean);
        return variable == null || variable.defs.length === 0;
    }
    return false;
}
function isMixedLogicalExpression(node) {
    const seen = new Set();
    const queue = [node.parent, node.left, node.right];
    for (const current of queue) {
        if (seen.has(current)) {
            continue;
        }
        seen.add(current);
        if (current.type === utils_1.AST_NODE_TYPES.LogicalExpression) {
            if (current.operator === '&&') {
                return true;
            }
            if (['||', '||='].includes(current.operator)) {
                // check the pieces of the node to catch cases like `a || b || c && d`
                queue.push(current.parent, current.left, current.right);
            }
        }
    }
    return false;
}
/**
 * Checks if two TSESTree nodes have the same member access sequence,
 * regardless of optional chaining differences.
 *
 * Note: This does not imply that the nodes are runtime-equivalent.
 *
 * Example: `a.b.c`, `a?.b.c`, `a.b?.c`, `(a?.b).c`, `(a.b)?.c` are considered similar.
 *
 * @param a First TSESTree node.
 * @param b Second TSESTree node.
 * @returns `true` if the nodes access members in the same order; otherwise, `false`.
 */
function areNodesSimilarMemberAccess(a, b) {
    if (a.type === utils_1.AST_NODE_TYPES.MemberExpression &&
        b.type === utils_1.AST_NODE_TYPES.MemberExpression) {
        if (!areNodesSimilarMemberAccess(a.object, b.object)) {
            return false;
        }
        if (a.computed === b.computed) {
            return (0, util_1.isNodeEqual)(a.property, b.property);
        }
        if (a.property.type === utils_1.AST_NODE_TYPES.Literal &&
            b.property.type === utils_1.AST_NODE_TYPES.Identifier) {
            return a.property.value === b.property.name;
        }
        if (a.property.type === utils_1.AST_NODE_TYPES.Identifier &&
            b.property.type === utils_1.AST_NODE_TYPES.Literal) {
            return a.property.name === b.property.value;
        }
        return false;
    }
    if (a.type === utils_1.AST_NODE_TYPES.ChainExpression ||
        b.type === utils_1.AST_NODE_TYPES.ChainExpression) {
        return areNodesSimilarMemberAccess((0, util_1.skipChainExpression)(a), (0, util_1.skipChainExpression)(b));
    }
    return (0, util_1.isNodeEqual)(a, b);
}
/**
 * Returns the branch nodes of a conditional expression:
 * - the "nonNullish branch" is the branch when test node is not nullish
 * - the "nullish branch" is the branch when test node is nullish
 */
function getBranchNodes(node, operator) {
    if (['', '!=', '!=='].includes(operator)) {
        return { nonNullishBranch: node.consequent, nullishBranch: node.alternate };
    }
    return { nonNullishBranch: node.alternate, nullishBranch: node.consequent };
}
function getOperatorAndNodesInsideTestExpression(node) {
    let operator = null;
    let nodesInsideTestExpression = [];
    if (isMemberAccessLike(node.test) ||
        node.test.type === utils_1.AST_NODE_TYPES.UnaryExpression) {
        operator = getNonBinaryNodeOperator(node.test);
    }
    else if (node.test.type === utils_1.AST_NODE_TYPES.BinaryExpression) {
        nodesInsideTestExpression = [node.test.left, node.test.right];
        if (node.test.operator === '==' ||
            node.test.operator === '!=' ||
            node.test.operator === '===' ||
            node.test.operator === '!==') {
            operator = node.test.operator;
        }
    }
    else if (node.test.type === utils_1.AST_NODE_TYPES.LogicalExpression &&
        node.test.left.type === utils_1.AST_NODE_TYPES.BinaryExpression &&
        node.test.right.type === utils_1.AST_NODE_TYPES.BinaryExpression) {
        if (isNodeNullishComparison(node.test.left) ||
            isNodeNullishComparison(node.test.right)) {
            return { nodesInsideTestExpression, operator };
        }
        nodesInsideTestExpression = [
            node.test.left.left,
            node.test.left.right,
            node.test.right.left,
            node.test.right.right,
        ];
        if (['||', '||='].includes(node.test.operator)) {
            if (node.test.left.operator === '===' &&
                node.test.right.operator === '===') {
                operator = '===';
            }
            else if (((node.test.left.operator === '===' ||
                node.test.right.operator === '===') &&
                (node.test.left.operator === '==' ||
                    node.test.right.operator === '==')) ||
                (node.test.left.operator === '==' && node.test.right.operator === '==')) {
                operator = '==';
            }
        }
        else if (node.test.operator === '&&') {
            if (node.test.left.operator === '!==' &&
                node.test.right.operator === '!==') {
                operator = '!==';
            }
            else if (((node.test.left.operator === '!==' ||
                node.test.right.operator === '!==') &&
                (node.test.left.operator === '!=' ||
                    node.test.right.operator === '!=')) ||
                (node.test.left.operator === '!=' && node.test.right.operator === '!=')) {
                operator = '!=';
            }
        }
    }
    return { nodesInsideTestExpression, operator };
}
function getNonBinaryNodeOperator(node) {
    if (node.type !== utils_1.AST_NODE_TYPES.UnaryExpression) {
        return '';
    }
    if (isMemberAccessLike(node.argument) && node.operator === '!') {
        return '!';
    }
    return null;
}
function formatComments(comments, separator) {
    return comments
        .map(({ type, value }) => type === utils_1.AST_TOKEN_TYPES.Line
        ? `//${value}${separator}`
        : `/*${value}*/${separator}`)
        .join('');
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    "use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const tsutils = __importStar(require("ts-api-utils"));
const ts = __importStar(require("typescript"));
const util_1 = require("../util");
const getMemberHeadLoc_1 = require("../util/getMemberHeadLoc");
const functionScopeBoundaries = [
    utils_1.AST_NODE_TYPES.ArrowFunctionExpression,
    utils_1.AST_NODE_TYPES.FunctionDeclaration,
    utils_1.AST_NODE_TYPES.FunctionExpression,
    utils_1.AST_NODE_TYPES.MethodDefinition,
].join(', ');
exports.default = (0, util_1.createRule)({
    name: 'prefer-readonly',
    meta: {
        type: 'suggestion',
        docs: {
            description: "Require private members to be marked as `readonly` if they're never modified outside of the constructor",
            requiresTypeChecking: true,
        },
        fixable: 'code',
        messages: {
            preferReadonly: "Member '{{name}}' is never reassigned; mark it as `readonly`.",
        },
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    onlyInlineLambdas: {
                        type: 'boolean',
                        description: 'Whether to restrict checking only to members immediately assigned a lambda value.',
                    },
                },
            },
        ],
    },
    defaultOptions: [{ onlyInlineLambdas: false }],
    create(context, [{ onlyInlineLambdas }]) {
        const services = (0, util_1.getParserServices)(context);
        const checker = services.program.getTypeChecker();
        const classScopeStack = [];
        function handlePropertyAccessExpression(node, parent, classScope) {
            if (ts.isBinaryExpression(parent)) {
                handleParentBinaryExpression(node, parent, classScope);
                return;
            }
            if (ts.isDeleteExpression(parent) || isDestructuringAssignment(node)) {
                classScope.addVariableModification(node);
                return;
            }
            if (ts.isPostfixUnaryExpression(parent) ||
                ts.isPrefixUnaryExpression(parent)) {
                handleParentPostfixOrPrefixUnaryExpression(parent, classScope);
            }
        }
        function handleParentBinaryExpression(node, parent, classScope) {
            if (parent.left === node &&
                tsutils.isAssignmentKind(parent.operatorToken.kind)) {
                classScope.addVariableModification(node);
            }
        }
        function handleParentPostfixOrPrefixUnaryExpression(node, classScope) {
            if (node.operator === ts.SyntaxKind.PlusPlusToken ||
                node.operator === ts.SyntaxKind.MinusMinusToken) {
                classScope.addVariableModification(node.operand);
            }
        }
        function isDestructuringAssignment(node) {
            let current = node.parent;
            while (current) {
                const parent = current.parent;
                if (ts.isObjectLiteralExpression(parent) ||
                    ts.isArrayLiteralExpression(parent) ||
                    ts.isSpreadAssignment(parent) ||
                    (ts.isSpreadElement(parent) &&
                        ts.isArrayLiteralExpression(parent.parent))) {
                    current = parent;
                }
                else if (ts.isBinaryExpression(parent) &&
                    !ts.isPropertyAccessExpression(current)) {
                    return (parent.left === current &&
                        parent.operatorToken.kind === ts.SyntaxKind.EqualsToken);
                }
                else {
                    break;
                }
            }
            return false;
        }
        function isFunctionScopeBoundaryInStack(node) {
            if (classScopeStack.length === 0) {
                return false;
            }
            const tsNode = services.esTreeNodeToTSNodeMap.get(node);
            if (ts.isConstructorDeclaration(tsNode)) {
                return false;
            }
            return tsutils.isFunctionScopeBoundary(tsNode);
        }
        function getEsNodesFromViolatingNode(violatingNode) {
            return {
                esNode: services.tsNodeToESTreeNodeMap.get(violatingNode),
                nameNode: services.tsNodeToESTreeNodeMap.get(violatingNode.name),
            };
        }
        function getTypeAnnotationForViolatingNode(node, type, initializerType) {
            const annotation = checker.typeToString(type);
            // verify the about-to-be-added type annotation is in-scope
            if (tsutils.isTypeFlagSet(initializerType, ts.TypeFlags.EnumLiteral)) {
                const scope = context.sourceCode.getScope(node);
                const variable = utils_1.ASTUtils.findVariable(scope, annotation);
                if (variable == null) {
                    return null;
                }
                const definition = variable.defs.find(def => def.isTypeDefinition);
                if (definition == null) {
                    return null;
                }
                const definitionType = services.getTypeAtLocation(definition.node);
                if (definitionType !== type) {
                    return null;
                }
            }
            return annotation;
        }
        return {
            [`${functionScopeBoundaries}:exit`](node) {
                if (utils_1.ASTUtils.isConstructor(node)) {
                    classScopeStack[classScopeStack.length - 1].exitConstructor();
                }
                else if (isFunctionScopeBoundaryInStack(node)) {
                    classScopeStack[classScopeStack.length - 1].exitNonConstructor();
                }
            },
            'ClassDeclaration, ClassExpression'(node) {
                classScopeStack.push(new ClassScope(checker, services.esTreeNodeToTSNodeMap.get(node), onlyInlineLambdas));
            },
            'ClassDeclaration, ClassExpression:exit'() {
                const finalizedClassScope = (0, util_1.nullThrows)(classScopeStack.pop(), 'Stack should exist on class exit');
                for (const violatingNode of finalizedClassScope.finalizeUnmodifiedPrivateNonReadonlys()) {
                    const { esNode, nameNode } = getEsNodesFromViolatingNode(violatingNode);
                    const reportNodeOrLoc = (() => {
                        switch (esNode.type) {
                            case utils_1.AST_NODE_TYPES.MethodDefinition:
                            case utils_1.AST_NODE_TYPES.PropertyDefinition:
                            case utils_1.AST_NODE_TYPES.TSAbstractMethodDefinition:
                                return { loc: (0, getMemberHeadLoc_1.getMemberHeadLoc)(context.sourceCode, esNode) };
                            case utils_1.AST_NODE_TYPES.TSParameterProperty:
                                return {
                                    loc: (0, getMemberHeadLoc_1.getParameterPropertyHeadLoc)(context.sourceCode, esNode, nameNode.name),
                                };
                            default:
                                return { node: esNode };
                        }
                    })();
                    const typeAnnotation = (() => {
                        if (esNode.type !== utils_1.AST_NODE_TYPES.PropertyDefinition) {
                            return null;
                        }
                        if (esNode.typeAnnotation || !esNode.value) {
                            return null;
                        }
                        if (nameNode.type !== utils_1.AST_NODE_TYPES.Identifier) {
                            return null;
                        }
                        const hasConstructorModifications = finalizedClassScope.memberHasConstructorModifications(nameNode.name);
                        if (!hasConstructorModifications) {
                            return null;
                        }
                        const violatingType = services.getTypeAtLocation(esNode);
                        const initializerType = services.getTypeAtLocation(esNode.value);
                        // if the RHS is a literal, its type would be narrowed, while the
                        // type of the initializer (which isn't `readonly`) would be the
                        // widened type
                        if (initializerType === violatingType) {
                            return null;
                        }
                        if (!tsutils.isLiteralType(initializerType)) {
                            return null;
                        }
                        return getTypeAnnotationForViolatingNode(esNode, violatingType, initializerType);
                    })();
                    context.report({
                        ...reportNodeOrLoc,
                        messageId: 'preferReadonly',
                        data: {
                            name: context.sourceCode.getText(nameNode),
                        },
                        *fix(fixer) {
                            yield fixer.insertTextBefore(nameNode, 'readonly ');
                            if (typeAnnotation) {
                                yield fixer.insertTextAfter(nameNode, `: ${typeAnnotation}`);
                            }
                        },
                    });
                }
            },
            [functionScopeBoundaries](node) {
                if (utils_1.ASTUtils.isConstructor(node)) {
                    classScopeStack[classScopeStack.length - 1].enterConstructor(services.esTreeNodeToTSNodeMap.get(node));
                }
                else if (isFunctionScopeBoundaryInStack(node)) {
                    classScopeStack[classScopeStack.length - 1].enterNonConstructor();
                }
            },
            MemberExpression(node) {
                if (classScopeStack.length !== 0 && !node.computed) {
                    const tsNode = services.esTreeNodeToTSNodeMap.get(node);
                    handlePropertyAccessExpression(tsNode, tsNode.parent, classScopeStack[classScopeStack.length - 1]);
                }
            },
        };
    },
});
const OUTSIDE_CONSTRUCTOR = -1;
const DIRECTLY_INSIDE_CONSTRUCTOR = 0;
var TypeToClassRelation;
(function (TypeToClassRelation) {
    TypeToClassRelation[TypeToClassRelation["ClassAndInstance"] = 0] = "ClassAndInstance";
    TypeToClassRelation[TypeToClassRelation["Class"] = 1] = "Class";
    TypeToClassRelation[TypeToClassRelation["Instance"] = 2] = "Instance";
    TypeToClassRelation[TypeToClassRelation["None"] = 3] = "None";
})(TypeToClassRelation || (TypeToClassRelation = {}));
class ClassScope {
    checker;
    onlyInlineLambdas;
    classType;
    constructorScopeDepth = OUTSIDE_CONSTRUCTOR;
    memberVariableModifications = new Set();
    memberVariableWithConstructorModifications = new Set();
    privateModifiableMembers = new Map();
    privateModifiableStatics = new Map();
    staticVariableModifications = new Set();
    constructor(checker, classNode, onlyInlineLambdas) {
        this.checker = checker;
        this.onlyInlineLambdas = onlyInlineLambdas;
        const classType = checker.getTypeAtLocation(classNode);
        if (tsutils.isIntersectionType(classType)) {
            this.classType = classType.types[0];
        }
        else {
            this.classType = classType;
        }
        for (const member of classNode.members) {
            if (ts.isPropertyDeclaration(member)) {
                this.addDeclaredVariable(member);
            }
        }
    }
    addDeclaredVariable(node) {
        if (!(tsutils.isModifierFlagSet(node, ts.ModifierFlags.Private) ||
            node.name.kind === ts.SyntaxKind.PrivateIdentifier) ||
            tsutils.isModifierFlagSet(node, ts.ModifierFlags.Accessor | ts.ModifierFlags.Readonly) ||
            ts.isComputedPropertyName(node.name)) {
            return;
        }
        if (this.onlyInlineLambdas &&
            node.initializer != null &&
            !ts.isArrowFunction(node.initializer)) {
            return;
        }
        (tsutils.isModifierFlagSet(node, ts.ModifierFlags.Static)
            ? this.privateModifiableStatics
            : this.privateModifiableMembers).set(node.name.getText(), node);
    }
    addVariableModification(node) {
        const modifierType = this.checker.getTypeAtLocation(node.expression);
        const relationOfModifierTypeToClass = this.getTypeToClassRelation(modifierType);
        if (relationOfModifierTypeToClass === TypeToClassRelation.Instance &&
            this.constructorScopeDepth === DIRECTLY_INSIDE_CONSTRUCTOR) {
            this.memberVariableWithConstructorModifications.add(node.name.text);
            return;
        }
        if (relationOfModifierTypeToClass === TypeToClassRelation.Instance ||
            relationOfModifierTypeToClass === TypeToClassRelation.ClassAndInstance) {
            this.memberVariableModifications.add(node.name.text);
        }
        if (relationOfModifierTypeToClass === TypeToClassRelation.Class ||
            relationOfModifierTypeToClass === TypeToClassRelation.ClassAndInstance) {
            this.staticVariableModifications.add(node.name.text);
        }
    }
    enterConstructor(node) {
        this.constructorScopeDepth = DIRECTLY_INSIDE_CONSTRUCTOR;
        for (const parameter of node.parameters) {
            if (tsutils.isModifierFlagSet(parameter, ts.ModifierFlags.Private)) {
                this.addDeclaredVariable(parameter);
            }
        }
    }
    enterNonConstructor() {
        if (this.constructorScopeDepth !== OUTSIDE_CONSTRUCTOR) {
            this.constructorScopeDepth += 1;
        }
    }
    exitConstructor() {
        this.constructorScopeDepth = OUTSIDE_CONSTRUCTOR;
    }
    exitNonConstructor() {
        if (this.constructorScopeDepth !== OUTSIDE_CONSTRUCTOR) {
            this.constructorScopeDepth -= 1;
        }
    }
    finalizeUnmodifiedPrivateNonReadonlys() {
        this.memberVariableModifications.forEach(variableName => {
            this.privateModifiableMembers.delete(variableName);
        });
        this.staticVariableModifications.forEach(variableName => {
            this.privateModifiableStatics.delete(variableName);
        });
        return [
            ...this.privateModifiableMembers.values(),
            ...this.privateModifiableStatics.values(),
        ];
    }
    getTypeToClassRelation(type) {
        if (type.isIntersection()) {
            let result = TypeToClassRelation.None;
            for (const subType of type.types) {
                const subTypeResult = this.getTypeToClassRelation(subType);
                switch (subTypeResult) {
                    case TypeToClassRelation.Class:
                        if (result === TypeToClassRelation.Instance) {
                            return TypeToClassRelation.ClassAndInstance;
                        }
                        result = TypeToClassRelation.Class;
                        break;
                    case TypeToClassRelation.Instance:
                        if (result === TypeToClassRelation.Class) {
                            return TypeToClassRelation.ClassAndInstance;
                        }
                        result = TypeToClassRelation.Instance;
                        break;
                }
            }
            return result;
        }
        if (type.isUnion()) {
            // any union of class/instance and something else will prevent access to
            // private members, so we assume that union consists only of classes
            // or class instances, because otherwise tsc will report an error
            return this.getTypeToClassRelation(type.types[0]);
        }
        if (!type.getSymbol() || !(0, util_1.typeIsOrHasBaseType)(type, this.classType)) {
            return TypeToClassRelation.None;
        }
        const typeIsClass = tsutils.isObjectType(type) &&
            tsutils.isObjectFlagSet(type, ts.ObjectFlags.Anonymous);
        if (typeIsClass) {
            return TypeToClassRelation.Class;
        }
        return TypeToClassRelation.Instance;
    }
    memberHasConstructorModifications(name) {
        return this.memberVariableWithConstructorModifications.has(name);
    }
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const util_1 = require("../util");
exports.default = (0, util_1.createRule)({
    name: 'prefer-ts-expect-error',
    meta: {
        type: 'problem',
        deprecated: {
            deprecatedSince: '7.11.0',
            replacedBy: [
                {
                    rule: {
                        name: '@typescript-eslint/ban-ts-comment',
                        url: 'https://typescript-eslint.io/rules/ban-ts-comment',
               