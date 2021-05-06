// deno run deno-json.ts > deno.json

const caseInsensitiveSort = (strA: string, strB: string): number => {
  const a = strA.toLowerCase();
  const b = strB.toLowerCase();
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

const sortedGlobals = [...Object.getOwnPropertyNames(globalThis)]
  .sort(caseInsensitiveSort);

const globals: Record<string, string> = {};
for (const key of sortedGlobals) globals[key] = 'readonly';

const spaces = 2;
const json = JSON.stringify({globals}, null, spaces);

console.log(json);
