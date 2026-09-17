import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
mkdirSync('work/tests',{recursive:true});
await build({entryPoints:['tests/core.test.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'work/tests/core.test.mjs'});
const result=spawnSync(process.execPath,['--test','work/tests/core.test.mjs'],{stdio:'inherit'});
process.exitCode=result.status??1;
