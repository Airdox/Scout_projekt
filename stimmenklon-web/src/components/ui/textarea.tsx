tion scope immediately following the global scope.
 * @param {boolean} [providedOptions.impliedStrict=false] implied strict mode
 * (if ecmaVersion >= 5).
 * @param {string} [providedOptions.sourceType='script'] the source type of the script. one of 'script', 'module', and 'commonjs'
 * @param {number} [providedOptions.ecmaVersion=5] which ECMAScript version is considered
 * @param {boolean} [providedOptions.jsx=false] support JSX references
 * @param {Object} [providedOptions.childVisitorKeys=null] Additional known visitor keys. See [esrecurse](https://github.com/estools/esrecurse)'s the `childVisitorKeys` option.
 * @param {string} [providedOptions.fallback='iteration'] A kind of the fallback in order to encounter with unknown node. See [esrecurse