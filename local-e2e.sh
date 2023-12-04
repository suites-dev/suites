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

# Clean up and build
execute_with_emoji "🧪" "Cleaning up" yarn lerna exec rimraf dist && rm -rf packages/types/index.d.ts
echo "🚧" "Building"
yarn build
execute_with_emoji "📦" "Packing" lerna exec npm pack

# Prepare tarballs
execute_with_emoji "📥" "Preparing tarballs" mkdir -p "$PWD"/e2e/tarballs
execute_with_emoji "📤" "Moving tarballs" lerna exec mv "*.tgz" "$PWD"/e2e/tarballs

# Rename tarballs
echo -e "📝 Renaming tarballs"
for file in "$PWD"/e2e/tarballs/automock-*.tgz; do
  [[ $file =~ automock-(.+)-[0-9]+\.[0-9]+\.[0-9]+(-dev\.[0-9]+)?\.tgz ]]
  new_name="${BASH_REMATCH[1]}.tgz"
  mv "$file" "$PWD/e2e/tarballs/$new_name"
done

# Function to setup and test for a specific framework and library
setup_and_test() {
  framework=$1
  library=$2

  execute_with_emoji "🧰" "\e[1mSetting up $framework with $library\e[0m" cp -r "$PWD/e2e/tarballs" "$PWD/e2e/$framework/$library"
  printf "\n"
  execute_with_emoji "🗑️" "Cleaning up $framework with $library" rm -rf "$PWD/e2e/$framework/$library/tarballs/{$framework,$library}.tgz"
  execute_with_emoji "💻" "Installing dependencies for $framework with $library" rm -rf "$PWD/e2e/$framework/$library/node_modules"
  execute_with_emoji "📦" "Installing dependencies for $framework with $library" npm install --prefix "$PWD/e2e/$framework/$library" --no-cache --no-package-lock
  execute_with_emoji "🏁" "Running tests for $framework with $library"
  npm test --prefix "$PWD/e2e/$framework/$library"

  printf "\n\n"
}

# Test Matrix
setup_and_test jest nestjs
setup_and_test sinon nestjs
setup_and_test jest inversify
setup_and_test sinon inversify

echo -e "🎉 Testing complete!"
