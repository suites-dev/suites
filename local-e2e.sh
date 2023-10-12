#!/bin/bash

yarn build
lerna exec -- npm pack
mkdir -p "$PWD"/e2e/tarballs
lerna exec -- mv "*.tgz" "$PWD"/e2e/tarballs

for file in "$PWD"/e2e/tarballs/automock-*.tgz; do
  [[ $file =~ automock-(.+)-[0-9]+\.[0-9]+\.[0-9]+(-dev\.[0-9]+)?\.tgz ]]
  new_name="${BASH_REMATCH[1]}.tgz"
  echo "$file > $PWD/e2e/tarballs/$new_name"

  mv "$file" "$PWD/e2e/tarballs/$new_name"
done

cp -r "$PWD/e2e/tarballs" "$PWD/e2e/jest/nestjs"
cp -r "$PWD/e2e/tarballs" "$PWD/e2e/sinon/nestjs"

rm -rf "$PWD/e2e/sinon/nestjs/tarballs/jest.tgz"
rm -rf "$PWD/e2e/jest/nestjs/tarballs/sinon.tgz"