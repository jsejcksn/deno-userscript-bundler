// eslint-disable-next-line max-len, no-unused-vars
export type RequestEventHandler = (request: Request) => Response | Promise<Response>;

export function serveHttp (
  requestEventHandler: RequestEventHandler,
  listenOptions?: Partial<Deno.ListenOptions>,
): {
  listener: Deno.Listener;
  url: URL;
} {
  const hostname = listenOptions?.hostname ?? '0.0.0.0';
  // eslint-disable-next-line no-magic-numbers
  const port = listenOptions?.port ?? 80;
  const listener = Deno.listen({hostname, port});

  (async () => {
    try {
      for await (const conn of listener) {
        (async () => {
          try {
            const httpConn = Deno.serveHttp(conn);
            for await (const {request, respondWith} of httpConn) {
              try {
                respondWith(requestEventHandler(request));
              }
              catch (ex) {
                console.error(ex);
              }
            }
          }
          catch (ex) {
            console.error(ex);
          }
        })();
      }
    }
    catch (ex) {
      console.error(ex);
    }
  })();

  return {
    listener,
    url: new URL(`http://${hostname}:${port}/`),
  };
}
