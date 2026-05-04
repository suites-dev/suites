rm -rf dist
mkdir -p dist
pnpm tsc -p tsconfig.cjs.json
pnpm tsc -p tsconfig.esm.json
