mkdir -p dist
pnpm tsc -p tsconfig.build.json --module commonjs --outDir dist/cjs
pnpm tsc -p tsconfig.build.json --module es2022 --outDir dist/esm
find dist/esm -type f -name "*.esm.js" | while read file; do
  mv "$file" "${file%.esm.js}.js"
done
find dist/esm -type f -name "*.esm.d.ts" | while read file; do
  mv "$file" "${file%.esm.d.ts}.d.ts"
done

