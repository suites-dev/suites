mkdir -p dist
tsc -p tsconfig.build.json --module commonjs --outDir dist/cjs
tsc -p tsconfig.build.json --module es2022 --outDir dist/esm
