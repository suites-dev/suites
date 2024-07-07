#!/bin/bash

# Function to show a loading spinner
show_spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'
  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    local temp=${spinstr#?}
    printf " [%c]  " "$spinstr"
    local spinstr=$temp${spinstr%"$temp"}
    sleep $delay
    printf "\b\b\b\b\b\b"
  done
  printf "    \b\b\b\b"
}

# Function to execute a command with a spinner, an emoji, and a message
execute_with_emoji() {
  local emoji=$1
  local message=$2
  shift 2
  echo -n "$emoji $message"
  ("$@" > /dev/null 2>&1) &
  show_spinner $!
  echo -e " ✅"
}

# Function to setup and test for a specific framework and library
setup_and_test() {
  framework=$1
  library=$2

  execute_with_emoji "🧰" "Setting up $framework with $library" cp -r "$PWD/e2e/tarballs" "$PWD/e2e/$framework/$library"
  printf "\n"
  execute_with_emoji "💻" "Installing dependencies for $framework with $library" rm -rf "$PWD/e2e/$framework/$library/node_modules"
  echo "📦 Installing dependencies for $framework with $library"
  npm install --registry http://localhost:4873 --prefix "$PWD/e2e/$framework/$library" --no-cache --no-package-lock
  execute_with_emoji "🏁" "Running tests for $framework with $library"

  npm test --prefix "$PWD/e2e/$framework/$library"

  printf "\n\n"
}

docker kill verdaccio
docker rm verdaccio

docker run -d --name verdaccio \
-p 4873:4873 \
-v "$PWD/e2e/config.yaml:/verdaccio/conf/config.yaml" \
verdaccio/verdaccio

sleep 3

# Clean up and build
execute_with_emoji "🧪" "Cleaning up" yarn lerna run prebuild
echo "🚧" "Building"
yarn build

npm config set registry http://localhost:4873

#find packages -name 'package.json' | while read filename; do
#  jq 'del(.publishConfig.provenance)' "$filename" > temp.json && mv temp.json "$filename"
#done
#
#git add .
#git commit -m "remove provenance"

yarn lerna publish from-package --yes \
  --no-git-tag-version \
  --no-push \
  --registry http://localhost:4873 \
  --no-changelog \
  --no-commit-hooks \
  --no-git-reset \
  --exact \
  --force-publish \
  --dist-tag e2e

echo "Cleaning source packages.."
git rm -rf packages

# Test Matrix
setup_and_test sinon nestjs
setup_and_test sinon inversify
setup_and_test jest nestjs
setup_and_test jest inversify
setup_and_test vitest nestjs
setup_and_test vitest inversify

echo -e "🎉 Testing complete!"

git stash
#git reset --hard HEAD~1

docker kill verdaccio
docker rm verdaccio