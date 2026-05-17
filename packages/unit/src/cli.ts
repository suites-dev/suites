#!/usr/bin/env node
// Reserved CLI entry. The `bin` slot in package.json is wired now so future
// subcommands (verify, setup-llm) can ship without a major bump.
console.error('suites: CLI is reserved and not yet implemented in this version.');
process.exit(2);
