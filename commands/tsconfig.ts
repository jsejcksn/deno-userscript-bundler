import {bundler, flags} from '../deps.ts';
import {requestPermission} from '../utils.ts';

function getTsConfigJson (options: Pick<Deno.EmitOptions, 'compilerOptions'>): string {
  const space = 2;
  const json = JSON.stringify(options, undefined, space);
  return json;
}

function isNonEmptyString (value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export async function tsconfigCmd (args: string[]): Promise<void> {
  const parsedArgs = flags.parse(args);
  const filePath = parsedArgs.o;

  const tsconfig = {compilerOptions: bundler.browserCompilerOptions};
  const json = getTsConfigJson(tsconfig);

  if (isNonEmptyString(filePath)) {
    await requestPermission(
      {name: 'write', path: filePath},
      'Write TSConfig file',
    );
    await Deno.writeTextFile(filePath, `${json}\n`);
    console.log(`TSConfig written to "${filePath}"`);
  }
  else {
    console.log(json);
  }
}

export default tsconfigCmd;
