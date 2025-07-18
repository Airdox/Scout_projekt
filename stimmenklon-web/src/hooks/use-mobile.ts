d returns the
 * analyzed scopes.
 * @function analyze
 * @param {espree.Tree} tree Abstract Syntax Tree
 * @param {Object} providedOptions Options that tailor the scope analysis
 * @param {boolean} [providedOptions.optimistic=false] the optimistic flag
 * @param {boolean} [providedOptions.ignoreEval=false] whether to check 'eval()' calls
 * @param {boolean} [providedOptions.nodejsScope=false] whether the whole
 * script is executed under node.js environment. When enabled, escope adds
 * a function scope immediately following the global scope.
 * @param {bool