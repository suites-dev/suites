// Copies packages/unit/llm/** into packages/unit/dist/llm/.
// Mirrors Vercel's `copy_docs` + `copy_skills` taskfile pattern, adapted
// to the tsc-based build (no taskr). Invoked at the end of build.sh.
import { cp, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'llm');
const dst = join(here, '..', 'dist', 'llm');

try {
  await access(src);
} catch {
  console.error(`copy-llm: source not found at ${src}`);
  process.exit(1);
}

await cp(src, dst, { recursive: true });
console.log(`copy-llm: ${src} -> ${dst}`);
