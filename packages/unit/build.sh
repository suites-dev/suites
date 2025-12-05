mkdir -p dist
pnpm tsc -p tsconfig.cjs.json --module commonjs --outDir dist/cjs
pnpm tsc -p tsconfig.esm.json --module es2022 --outDir dist/esm

# Rename ESM-specific files (overwrites package-resolver.js with ESM version)
find dist/esm -type f -name "*.esm.js" | while read file; do
  mv "$file" "${file%.esm.js}.js"
done
find dist/esm -type f -name "*.esm.d.ts" | while read file; do
  mv "$file" "${file%.esm.d.ts}.d.ts"
done

