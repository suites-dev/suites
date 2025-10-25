#!/bin/bash
set -e

mkdir -p dist/cjs dist/esm

# Build CommonJS
echo "Building CommonJS..."
pnpm tsc -p tsconfig.cjs.json

# Build ESM with NodeNext
echo "Building ESM (NodeNext)..."
pnpm tsc -p tsconfig.esm.json

echo "✅ Build complete"
