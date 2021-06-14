import {ensureDir, path} from '../deps.ts';
import {
  exitWithMessage,
  openInVsCode,
  requestPermission,
  statsIfExists,
} from '../utils.ts';
import {FileName, templates} from '../data/templates.ts';

export async function newCmd (args: string[]): Promise<void> {
  const [dir] = args;
  if (!dir) exitWithMessage(1, 'No directory argument provided');

  try {
    await requestPermission(
      {name: 'write', path: dir},
      'Create directory and files',
    );

    await requestPermission(
      {name: 'read', path: dir},
      'Determine if directory already exists',
    );

    await ensureDir(dir);
  }
  catch (ex) {
    if (ex instanceof Error) {
      // https://deno.land/std@0.98.0/fs/ensure_dir.ts#L14
      const expectedString = `Ensure path exists, expected 'dir', got '`;
      if (ex.message.startsWith(expectedString)) {
        exitWithMessage(1, `"${dir}" already exists, but is not a directory`);
      }
      throw ex;
    }
    throw new Error(ex);
  }

  const entrypointPath = path.join(dir, FileName.Entrypoint);
  const stats = await statsIfExists(entrypointPath);

  if (stats.exists) {
    if (stats.isFile) {
      console.log('Entrypoint already exists');

      if (await requestPermission(
        {command: 'code', name: 'run'},
        'Open file in VS Code',
      )) await openInVsCode(entrypointPath);

      Deno.exit(0);
    }
    else {
      exitWithMessage(1, 'Entrypoint already exists, but is not a file');
    }
  }
  else {
    await Deno.writeFile(entrypointPath, templates[FileName.Entrypoint]);
    console.log(`"${entrypointPath}" written`);
  }

  const metablockPath = path.join(dir, FileName.Metablock);
  await Deno.writeFile(metablockPath, templates[FileName.Metablock]);
  console.log(`"${metablockPath}" written`);

  if (await requestPermission(
    {command: 'code', name: 'run'},
    'Open files in VS Code',
  )) {
    await openInVsCode(entrypointPath);
    await openInVsCode(metablockPath);
  }
}

export default newCmd;
