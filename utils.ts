import {path, readLines} from './deps.ts';

export function exitWithMessage (code: number, message: string): never {
  console[code === 1 ? 'error' : 'log'](message);
  Deno.exit(code);
}

// eslint-disable-next-line max-len
export async function findMetablockPath (dir: string): Promise<string | undefined> {
  let metablockPath: string | undefined;

  const metablockPaths = ['.json', '.js', '.yaml', '.yml']
    .map(ext => path.join(dir, `metablock${ext}`));

  for (const filePath of metablockPaths) {
    const stats = await statsIfExists(filePath);
    if (stats.exists && stats.isFile) {
      metablockPath = filePath;
      break;
    }
  }

  return metablockPath;
}

/** hh:mm:ss.ssss */
export function getLocalPreciseTime (): string {
  const locale = 'en-US';

  /** hh:mm:ss.sss */
  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    fractionalSecondDigits: 3,
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
  };

  // const formatter = new Intl.DateTimeFormat(locale, timeFormatOptions);
  // return formatter.format(new Date());
  return new Date().toLocaleString(locale, timeFormatOptions);
}

/** Read lines, invoking a callback with each line. Call `close()` on reader. */
async function handleLines (
  reader: Deno.Reader & {close?: () => void},
  // eslint-disable-next-line no-unused-vars
  callback: (line: string) => unknown,
): Promise<void> {
  for await (const line of readLines(reader)) callback(line);
  reader.close?.();
}

export async function getProcessOutput (
  cmd: string[],
  options: {
    /* eslint-disable no-unused-vars */
    onStdErrLine?: (line: string) => unknown;
    onStdOutLine?: (line: string) => unknown;
    /* eslint-enable no-unused-vars */
  } = {},
): Promise<{
  status: Deno.ProcessStatus;
  stderr: string;
  stdout: string;
}> {
  const process = Deno.run({cmd, stderr: 'piped', stdout: 'piped'});

  const stdErrLines: string[] = [];
  const stdOutLines: string[] = [];

  const [status] = await Promise.all([
    process.status(),
    handleLines(process.stderr, line => {
      stdErrLines.push(line);
      options.onStdErrLine?.(line);
    }),
    handleLines(process.stdout, line => {
      stdOutLines.push(line);
      options.onStdOutLine?.(line);
    }),
  ]);

  process.close();

  return {
    status,
    stderr: stdErrLines.join('\n'),
    stdout: stdOutLines.join('\n'),
  };
}

export function handleCommand (
  command: string,
  args: string[],
  // eslint-disable-next-line no-unused-vars
  branches: Record<string, (args: string[]) => void | Promise<void>>,
  // eslint-disable-next-line no-unused-vars
  defaultCase?: (command: string) => void | Promise<void>,
): void | Promise<void> {
  for (const [commandName, callback] of Object.entries(branches)) {
    if (commandName === command) return callback(args);
  }
  if (defaultCase) return defaultCase(command);
}

let isDockerMemo: boolean;

/** Adapted from https://unpkg.com/is-docker@2.2.1/index.js */
export async function isDocker ({promptForPermissions}: {
  promptForPermissions?: boolean;
} = {}): Promise<boolean> {
  async function hasDockerEnv () {
    try {
      if (promptForPermissions) {
        await requestPermission(
          {name: 'read', path: '/.dockerenv'},
          'Determine if environment is Docker',
        );
      }
      await Deno.stat('/.dockerenv');
      return true;
    }
    catch (ex) {
      if (ex instanceof Deno.errors.NotFound) return false;
      throw ex;
    }
  }

  async function hasDockerCGroup () {
    try {
      if (promptForPermissions) {
        await requestPermission(
          {name: 'read', path: '/proc/self/cgroup'},
          'Determine if environment is Docker',
        );
      }
      return (await Deno.readTextFile('/proc/self/cgroup')).includes('docker');
    }
    catch (ex) {
      if (ex instanceof Deno.errors.NotFound) return false;
      throw ex;
    }
  }

  if (typeof isDockerMemo !== 'boolean') {
    isDockerMemo = await hasDockerEnv() || await hasDockerCGroup();
  }

  return isDockerMemo;
}

let isWslMemo: boolean;

/** Adapted from https://unpkg.com/is-wsl@2.2.0/index.js */
export async function isWsl ({promptForPermissions}: {
  promptForPermissions?: boolean;
} = {}): Promise<boolean> {
  async function determine () {
    if (Deno.build.os !== 'linux') return false;

    // This substituted condition is not high-effort
    let match = Deno.build.vendor.toLowerCase().includes('microsoft');
    if (match) {
      if (await isDocker({promptForPermissions})) return false;
      return true;
    }

    try {
      if (promptForPermissions) {
        await requestPermission(
          {name: 'read', path: '/proc/version'},
          'Determine if environment is WSL',
        );
      }
      match = (await Deno.readTextFile('/proc/version')).toLowerCase().includes('microsoft');
      return match
        ? !(await isDocker({promptForPermissions}))
        : false;
    }
    catch (ex) {
      if (ex instanceof Deno.errors.NotFound) return false;
      throw ex;
    }
  }

  if (typeof isWslMemo !== 'boolean') isWslMemo = await determine();
  return isWslMemo;
}

export async function openInVsCode (path: string): Promise<void> {
  console.log(`Opening "${path}" in VS Code`);
  const p = Deno.run({cmd: ['code', path]});
  const {success} = await p.status();
  if (!success) {
    throw new Error(`There was a problem opening "${path}" in VS Code. See console output for more details.`);
  }
}

export async function requestPermission (
  descriptor: Deno.PermissionDescriptor,
  purpose?: string,
): Promise<boolean> {
  const status = await Deno.permissions.query(descriptor);
  if (status.state === 'prompt') {
    if (purpose) console.log(`ℹ️  ${purpose}`);
    await Deno.permissions.request(descriptor);
  }
  return status.state === 'granted';
}

export async function resolveRealPath (
  path: string,
  {promptForPermissions}: {promptForPermissions?: boolean} = {},
): Promise<string> {
  if (promptForPermissions) {
    await requestPermission(
      {name: 'read', path: '.'},
      'Create an absolute path',
    );
  }

  const absolutePath = await Deno.realPath(path);
  if (!(await isWsl({promptForPermissions}))) return absolutePath;

  if (promptForPermissions) {
    await requestPermission(
      {command: 'wslpath', name: 'run'},
      'Resolve the Windows path',
    );
  }

  const cmd = ['wslpath', '-w', absolutePath];
  const {status: {success}, stderr, stdout} = await getProcessOutput(cmd);
  if (!success) throw new Error(stderr);
  return stdout.trim();
}

type MaybeStats = {exists: false} | (Deno.FileInfo & {exists: true});

export async function statsIfExists (path: string): Promise<MaybeStats> {
  try {
    const info = await Deno.lstat(path);
    return Object.assign(info, {exists: true});
  }
  catch (ex) {
    if (ex instanceof Deno.errors.NotFound) return {exists: false};
    throw ex;
  }
}
