'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var estraverse = require('estraverse');
var esrecurse = require('esrecurse');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var estraverse__default = /*#__PURE__*/_interopDefaultLegacy(estraverse);
var esrecurse__default = /*#__PURE__*/_interopDefaultLegacy(esrecurse);

/**
 * @fileoverview Assertion utilities.
 * @author Nicholas C. Zakas
 */

/**
 * Throws an error if the given condition is not truthy.
 * @param {boolean} condition The condition to check.
 * @param {string} message The message to include with the error.
 * @returns {void}
 * @throws {Error} When the condition is not truthy.
 */
function assert(condition, message = "Assertion failed.") {
    if (!condition) {
        throw new Error(message);
    }
}

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
  IMPLIED WARRANTIES OF MERCHANTABILITY AN