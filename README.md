# deno-userscript-bundler


---

## ⚠️ Notice

A breaking change was introduced in Deno
[v`1.22.0`](https://github.com/denoland/deno/releases/tag/v1.22.0),
which affects this repository:

> BREAKING: Remove unstable `Deno.emit` and `Deno.formatDiagnostics` APIs
> ([#14463](https://github.com/denoland/deno/pull/14463))

The removed APIs were relocated to a third-party module,
[`deno.land/x/emit`](https://deno.land/x/emit),
but were only migrated in part. At the time of writing of this notice,
[issues](https://github.com/denoland/deno_emit/issues) exist which prevent
refactoring this codebase without disruption. I plan to update this project
after those issues have been resolved.

In the iterim, a potential workaround is to use Deno's
[`compile` API](https://deno.land/manual@v1.21.3/tools/compiler)
with Deno
[v`1.21.3`](https://github.com/denoland/deno/releases/tag/v1.21.3)
to create a binary as a substitute for [installing](#install) the script.

---


## To-do

- Write documentation
- Write tests


## Install

```
deno install --unstable --name uscript-deno main.ts
```

> To avoid being prompted for permissions every time, install with the following permissions:

```
deno install --unstable --allow-net --allow-read --allow-run --allow-write --name uscript-deno main.ts
```

(Some permissions aren't strictly necessary, but allow for an enhanced experience — e.g. `--allow-run` is only used to open files in VS Code and to get the correct Windows path in WSL)


## Use

Generate a new directory with a script template (main.ts) and metablock template (metablock.yaml)
```sh
uscript-deno new $DIR
# uscript-deno new path/to/new/dir
```
```
Created:
path/to/new/dir
├ main.ts
└ metablock.yaml
```

Bundle userscript
```sh
uscript-deno bundle $ENTRYPOINT
# uscript-deno bundle path/to/project/main.ts
```
```
Written:
path/to/project/main.bundle.user.js
```

Run in development mode: Watches entrypoint file for changes and bundles again on each change. Also provides metablock userscript on localhost server for quick installation by a script manager extension (e.g. Tampermonkey) (requires fs access by the script manager)
```sh
uscript-deno dev $ENTRYPOINT
# uscript-deno dev path/to/project/main.ts
```
```
Development userscript metablock at:
http://localhost:10741/meta.user.js

Watching for file changes…
Use ctrl+c to stop.

18:33:11.796 Bundling…
18:33:13.211 Done (1416ms)
…
```

Generate TSConfig for use with VS Code Deno extension
```sh
# print to stdout
uscript-deno tsconfig

# or write to file
uscript-deno tsconfig -o $TSCONFIG_PATH
# uscript-deno tsconfig -o path/to/new/tsconfig.json
```
```
Written:
path/to/new/tsconfig.json
```


## Notes

Template file data can be modified before installing and are located at [`data/templates.ts`](data/templates.ts)
