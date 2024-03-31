mkdir -p dist
yarn tsc -p tsconfig.build.json --module commonjs --outDir dist/cjs
yarn tsc -p tsconfig.build.json --module es2022 --outDir dist/esm
