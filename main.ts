import {exitWithMessage, handleCommand} from './utils.ts';
import bundleCmd from './commands/bundle.ts';
import devCmd from './commands/dev.ts';
import newCmd from './commands/new.ts';
import tsconfigCmd from './commands/tsconfig.ts';

async function main () {
  const [command, ...args] = Deno.args;
  if (!command) exitWithMessage(1, 'No command argument provided');

  await handleCommand(command, args, {
    bundle: bundleCmd,
    dev: devCmd,
    new: newCmd,
    tsconfig: tsconfigCmd,
  }, cmd => exitWithMessage(1, `Command not recognized: "${cmd}"`));
}

if (import.meta.main) main();
