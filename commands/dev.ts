// Implement handling of Deno.signals?

import {BundleInfo, bundleUserscript} from '../mod.ts';
import {
  exitWithMessage,
  getLocalPreciseTime,
  isWsl,
  openInVsCode,
  requestPermission,
  resolveRealPath,
} from '../utils.ts';
import {path, Status} from '../deps.ts';
import {RequestEventHandler, serveHttp} from '../server.ts';

type WatchOptions = {
  delay?: number;
  signal?: AbortSignal;
};

async function watchFileForChanges (
  filePath: string,
  // eslint-disable-next-line no-unused-vars
  callback: (ev: Deno.FsEvent & {kind: 'modify'}) => unknown,
  options: WatchOptions = {},
): Promise<void> {
  const defaultDelay = 800;
  const watcher = Deno.watchFs(filePath, {recursive: false});
  options.signal?.addEventListener('abort', watcher.close);

  let t0 = performance.now();

  for await (const ev of watcher) {
    if (ev.kind !== 'modify') continue;

    const t1 = performance.now();
    const duration = t1 - t0;

    if (duration < (options.delay ?? defaultDelay)) continue;

    t0 = t1;
    callback(ev as typeof ev & {kind: 'modify'});
  }
}

export async function devCmd (args: string[]): Promise<void> {
  const [entrypointPath] = args;
  if (!entrypointPath) exitWithMessage(1, 'No entrypoint argument provided');

  let info: BundleInfo;
  try {
    info = await bundleUserscript(entrypointPath);
  }
  catch (ex) {
    if (ex instanceof Deno.errors.PermissionDenied) {
      exitWithMessage(1, `Couldn't bundle script. See details below:\n${ex.message}`);
    }
    else throw ex;
  }

  const ac = new AbortController();

  if (await requestPermission(
    {name: 'read', path: '.'},
    'Create an absolute path to the output file',
  )) {
    const realPath = await resolveRealPath(
      info.path,
      {promptForPermissions: true},
    );

    const hostname = 'localhost';
    const port = 10741;

    if (await requestPermission(
      {host: `${hostname}:${port}`, name: 'net'},
      'Provide userscript at localhost URL',
    )) {
      const fileUrl = (await isWsl({promptForPermissions: true})
        ? path.win32
        : path).toFileUrl(realPath).href;
      info.metablockEntries.push(['require', fileUrl]);
      const metablock = info.metablockEntries.toString();

      const metablockUrl = new URL(`http://${hostname}:${port}/meta.user.js`);

      const handleRequest: RequestEventHandler = req => {
        const reqUrl = new URL(req.url);
        if (reqUrl.pathname === metablockUrl.pathname) {
          return new Response(metablock, {
            headers: new Headers({
              'cache-control': 'no-store, max-age=0',
              'content-type': 'text/javascript',
            }),
          });
        }

        const message = `
        <div style="font-family: monospace">
          <p>Bad Request. Use <a href="${metablockUrl.href}">${metablockUrl.href}</a></p>
        </div>
        `;
        return new Response(message, {
          headers: new Headers({
            'cache-control': 'no-store, max-age=0',
            'content-type': 'text/html',
          }),
          status: Status.BadRequest,
        });
      };

      serveHttp(handleRequest, {hostname, port});
      console.log(`Development userscript metablock at:\n${metablockUrl.href}\n`);
    }
  }

  if (await requestPermission(
    {command: 'code', name: 'run'},
    'Open file in VS Code',
  )) await openInVsCode(entrypointPath);

  const handleChange = async (): Promise<void> => {
    console.log(`${getLocalPreciseTime()} Bundling…`);
    const t0 = performance.now();
    await bundleUserscript(entrypointPath);
    const durationMs = performance.now() - t0;
    console.log(`${getLocalPreciseTime()} Done (${durationMs}ms)`);
  };

  watchFileForChanges(
    entrypointPath,
    handleChange,
    {signal: ac.signal},
  );

  console.log('Watching for file changes…\nUse ctrl+c to stop.\n');
}

export default devCmd;
