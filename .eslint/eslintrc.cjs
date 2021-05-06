const deno = require('./deno.json');
const tsEslint = require('./typescript-eslint-base.json');

module.exports = {
  extends: [...tsEslint.extends, '@jsejcksn'],
  globals: deno.globals,
  parser: tsEslint.parser,
  plugins: tsEslint.plugins,
  root: true,
};
