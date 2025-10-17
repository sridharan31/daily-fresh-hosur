// InternalBytecode.js
// Small stub to satisfy Metro symbolication that expects this file path in some stack traces.
// This file is intentionally harmless. It prevents ENOENT errors during symbolication in dev.

// eslint-disable-next-line no-unused-vars
const __internal = (() => {
  function noop() {}
  return { noop };
})();

module.exports = __internal;
