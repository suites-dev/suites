#!/bin/bash
set -e
mkdir -p dist/cjs dist/esm
echo "Building CommonJS..."
pnpm tsc -p tsconfig.cjs.json
echo "Building ESM (NodeNext)..."
pnpm tsc -p tsconfig.esm.json
echo "✅ Build complete"
