mkdir -p dist
pnpm tsc -p tsconfig.build.json --module commonjs --outDir dist/cjs
pnpm tsc -p tsconfig.build.json --module es2022 --outDir dist/esm
