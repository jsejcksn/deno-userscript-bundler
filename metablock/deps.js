import {parse} from 'https://deno.land/std@0.95.0/encoding/yaml.ts';

export * as path from 'https://deno.land/std@0.95.0/path/mod.ts';
export * as semver from 'https://deno.land/x/semver@v1.3.0/mod.ts';
export {existsSync} from 'https://deno.land/std@0.95.0/fs/exists.ts';
export {isUri} from './valid-url@1.0.9.js';

export const YAML = {safeLoad: parse};

export const debug = () => () => {};

export function readJsonSync (filePath) {
  return JSON.parse(Deno.readTextFileSync(filePath));
}
