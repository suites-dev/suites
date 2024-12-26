mkdir -p dist

# Build CJS version
yarn tsc -p tsconfig.build.json --module commonjs --moduleResolution node --outDir dist/cjs

# Build ESM version
yarn tsc -p tsconfig.build.json --module es2022 --moduleResolution bundler --outDir dist/esm
