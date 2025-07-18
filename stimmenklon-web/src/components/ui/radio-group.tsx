# cross-spawn

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][ci-image]][ci-url] [![Build status][appveyor-image]][appveyor-url]

[npm-url]:https://npmjs.org/package/cross-spawn
[downloads-image]:https://img.shields.io/npm/dm/cross-spawn.svg
[npm-image]:https://img.shields.io/npm/v/cross-spawn.svg
[ci-url]:https://github.com/moxystudio/node-cross-spawn/actions/workflows/ci.yaml
[ci-image]:https://github.com/moxystudio/node-cross-spawn/actions/workflows/ci.yaml/badge.svg
[appveyor-url]:https://ci.appveyor.com/project/satazor/node-cross-spawn
[appveyor-image]:https://img.shields.io/appveyor/ci/satazor/node-cross-spawn/master.svg

A cross platform solution to node's spawn and spawnSync.

## Installation

Node.js version 8 and up:
`$ npm install cross-spawn`

Node.js version 7 and under:
`$ npm install cross-spawn@6`

## Why

Node has issues when using spawn on Windows:

- It ignores [PATHEXT](https://github.com/joyent/node/issues/2318)
- It does not support [shebangs](https://en.wikipedia.org/wiki/Shebang_(Unix))
- Has problems running commands with [spaces](https://github.com/nodejs/node/issues/7367)
- Has problems running commands with posix relative paths (e.g.: `./my-folder/my-executable`)
- Has an [issue](https://github.com/moxystudio/node-cross-spawn/issues/82) with command shims (files in `node_modules/.bin/`), where arguments with quotes and parenthesis would result in [invalid syntax error