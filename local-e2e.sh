#!/bin/bash

yarn lerna exec rimraf dist
rm -rf packages/types/index.d.ts
yarn build
lerna exec npm pack
mkdir -p "$PWD"/e2e/tarballs
lerna exec mv "*.tgz" "$PWD"/e2e/tarballs

for file in "$PWD"/e2e/tarballs/automock-*.tgz; do
  [[ $file =~ automock-(.+)-[0-9]+\.[0-9]+\.[0-9]+(-dev\.[0-9]+)?\.tgz ]]
  new_name="${BASH_REMATCH[1]}.tgz"
  echo "$file > $PWD/e2e/tarballs/$new_name"

  mv "$file" "$PWD/e2e/tarballs/$new_name"
done

# NestJS
cp -r "$PWD/e2e/tarballs" "$PWD/e2e/jest/nestjs"
cp -r "$PWD/e2e/tarballs" "$PWD/e2e/sinon/nestjs"

rm -rf "$PWD/e2e/sinon/nestjs/tarballs/jest.tgz"
rm -rf "$PWD/e2e/jest/nestjs/tarballs/sinon.tgz"

rm -rf "$PWD/e2e/jest/nestjs/node_modules"
rm -rf "$PWD/e2e/sinon/nestjs/node_modules"

npm install --prefix "$PWD/e2e/jest/nestjs" --no-cache --no-package-lock
npm install --prefix "$PWD/e2e/sinon/nestjs" --no-cache --no-package-lock

# Inversify
cp -r "$PWD/e2e/tarballs" "$PWD/e2e/jest/inversify"
cp -r "$PWD/e2e/tarballs" "$PWD/e2e/sinon/inversify"

rm -rf "$PWD/e2e/sinon/inversify/tarballs/jest.tgz"
rm -rf "$PWD/e2e/jest/inversify/tarballs/sinon.tgz"

rm -rf "$PWD/e2e/jest/inversify/node_modules"
rm -rf "$PWD/e2e/sinon/inversify/node_modules"

npm install --prefix "$PWD/e2e/jest/inversify" --no-cache --no-package-lock
npm install --prefix "$PWD/e2e/sinon/inversify" --no-cache --no-package-lock

npm test --prefix "$PWD/e2e/jest/nestjs"
npm test --prefix "$PWD/e2e/sinon/nestjs"
npm test --prefix "$PWD/e2e/jest/inversify"
npm test --prefix "$PWD/e2e/sinon/inversify"
