import {bundleUserscript} from '../mod.ts';
import {exitWithMessage} from '../utils.ts';

export async function bundleCmd (args: string[]): Promise<void> {
  const [entrypointPath] = args;
  if (!entrypointPath) exitWithMessage(1, 'No entrypoint argument provided');

  const info = await bundleUserscript(entrypointPath);
  console.log(`"${info.path}" written`);
}

export default bundleCmd;
