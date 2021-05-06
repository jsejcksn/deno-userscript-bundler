# deno-userscript-bundler


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


## Notes

Template file data can be modified before installing and are located at [`data/templates.ts`](data/templates.ts)
