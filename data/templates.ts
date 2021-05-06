function encodeTextFile (str: string): Uint8Array {
  return new TextEncoder().encode(`${str.trim()}\n`);
}

export enum FileName {
  /* eslint-disable no-unused-vars */
  Entrypoint = 'main.ts',
  Metablock = 'metablock.yaml',
  /* eslint-enable no-unused-vars */
}

const entrypointFile = encodeTextFile(`
(async () => {
  console.log('hello world');
})();
`);

const metablockFile = encodeTextFile(`
name: Untitled userscript
description: No description
version: 0.1.0
match:
  - https://*/*
license: MIT
author: Octocat
namespace: https://github.com/octocat
noframes: true
run-at: document-idle
grant: none
`);

export const templates: Record<FileName, Uint8Array> = {
  [FileName.Entrypoint]: entrypointFile,
  [FileName.Metablock]: metablockFile,
};
