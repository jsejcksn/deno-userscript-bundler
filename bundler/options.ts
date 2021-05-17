/* eslint-disable line-comment-position, max-len */
// This is as close as possible to "WSYIWYG/just erase types"
export const baseCompilerOptions: Deno.CompilerOptions = {
  // allowJs: true // default
  // declaration: true, // not supported for bundles [yet]
  // declarationDir: 'types', // doesn't seem to work [yet?]
  // inlineSourceMap: true,
  // inlineSources: true,
  lib: ['ESNext'],
  // jsx: 'react-jsx', // not supported [yet?]
  // module: 'esnext', // default
  // noImplicitAny: true, // default
  noImplicitReturns: true,
  // removeComments: true, // default
  sourceMap: false, // is documented as false by default, but appears to be true by default
  // strict: true, // default
  // target: 'esnext', // default
  // types: [] // needed?
};
/* eslint-enable line-comment-position, max-len */

export const browserCompilerOptions: Deno.CompilerOptions = {
  ...baseCompilerOptions,
  lib: [
    'DOM',
    'DOM.Iterable',
    'ESNext',
  ],
};

export const emitOptions: Deno.EmitOptions = {
  bundle: 'module',
  compilerOptions: browserCompilerOptions,
  // sources: {},
};
