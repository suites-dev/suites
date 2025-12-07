#!/usr/bin/env npx ts-node

import { spawn, SpawnOptions } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const PWD = process.cwd();
const COMPOSE_FILE = 'local-e2e.docker-compose.yaml';
const NODE_CONTAINER = 'executor';
const VERDACCIO_URL = 'http://verdaccio:4873';

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

async function main(): Promise<void> {
  console.log('🧪 Cleaning up...');
  await exec('pnpm', ['lerna', 'run', 'prebuild']);

  console.log('🚧 Building Packages...');
  await exec('pnpm', ['build', '--stream']);

  await withDockerCompose(async () => {
    await withGitSnapshot(async () => {
      await removeProvenceFromPackages();

      await exec('git', ['add', '.']);
      await exec('git', ['commit', '-m="remove provenance [temp e2e]"']);

      console.log('Versioning packages...');

      const currentBranch = (await execCapture('git', ['branch', '--show-current'])).trim();

      await exec('pnpm', [
        'lerna',
        'version',
        'prerelease',
        '--yes',
        '--no-changelog',
        '--allow-branch',
        currentBranch,
        '--no-git-tag-version',
        '--no-push',
        '--force-publish',
        '--no-commit-hooks',
      ]);

      await exec('git', ['add', '.']);
      await exec('git', ['commit', '-m="version packages [temp e2e]"']);

      console.log('📦 Publishing packages to Verdaccio...');

      await exec('pnpm', [
        'lerna',
        'publish',
        'from-package',
        '--yes',
        '--no-git-tag-version',
        '--no-push',
        '--registry',
        'http://localhost:4873',
        '--no-changelog',
        '--no-commit-hooks',
        '--no-git-reset',
        '--exact',
        '--force-publish',
        '--dist-tag',
        'e2e',
      ]);
    });

    const e2es = [
      // NestJS
      'jest/nestjs',
      'vitest/nestjs',
      'sinon/nestjs',
      'esm/jest/nestjs',
      'esm/vitest/nestjs',
      // Inversify
      'jest/inversify',
      'vitest/inversify',
      'sinon/inversify',
    ];

    for (const e2e of e2es) {
      await setupAndTest(`/e2e/${e2e}`);
    }

    console.log('🎉 Testing complete!');
  });
}

async function removeProvenceFromPackages() {
  console.log('Removing provenance from package.json');

  for (const file of await listPackageJsons('packages')) {
    await removeProvenance(file);
  }
}

async function withGitSnapshot(callback: () => Promise<void>): Promise<void> {
  const currentCommit = (await execCapture('git', ['rev-parse', 'HEAD'])).trim();
  if (!currentCommit) {
    throw new Error('Could not get current commit');
  }

  // Check if there are changes to stash
  const status = await execCapture('git', ['status', '--porcelain']);
  const hasChanges = status.trim().length > 0;

  if (hasChanges) {
    console.log('🔍 Stashing changes...');
    await exec('git', ['stash', 'push', '-m', `temp-e2e-${currentCommit}`]);
  } else {
    console.log('🔍 No changes to stash');
  }

  try {
    await callback();
  } finally {
    await exec('git', ['reset', '--hard', currentCommit]);
    if (hasChanges) {
      console.log('🔍 Restoring stashed changes...');
      await exec('git', ['stash', 'pop']);
    }
  }
}

async function withDockerCompose(callback: () => Promise<void>): Promise<void> {
  try {
    await verifyDocker();
    await startDockerCompose();
    await callback();
  } finally {
    await cleanDockerCompose();
  }
}

// --- Utility Functions ---

interface ExecOptions extends SpawnOptions {
  silent?: boolean;
}

/**
 * Executes a command with streaming output (piped stdio)
 */
function exec(command: string, args: string[] = [], options: ExecOptions = {}): Promise<number> {
  const { silent, ...spawnOptions } = options;
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: silent ? 'ignore' : 'inherit',
      shell: true,
      ...spawnOptions,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`));
      }
    });
  });
}

/**
 * Executes a command and captures its output
 */
function execCapture(command: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['inherit', 'pipe', 'inherit'],
      shell: true,
    });

    let output = '';
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command "${command} ${args.join(' ')}" exited with code ${code}`));
      }
    });
  });
}

/**
 * Executes a command inside the node container
 */
function execInNodeContainer(
  command: string,
  args: string[] = [],
  options: ExecOptions = {}
): Promise<number> {
  return exec(
    'docker compose',
    ['-f', COMPOSE_FILE, 'exec', NODE_CONTAINER, command, ...args],
    options
  );
}

/**
 * Reset the node container to a clean state
 */
async function resetNodeContainer(): Promise<void> {
  console.log('🔄 Resetting node container...');
  await exec('docker compose', ['-f', COMPOSE_FILE, 'restart', NODE_CONTAINER, '--timeout=0']);
  await execInNodeContainer('npm', ['config', 'set', 'registry', VERDACCIO_URL]);
}

/**
 * Setup and test for a specific e2e package
 */
async function setupAndTest(packagePath: string): Promise<void> {
  console.log(`➡️ Setting up and testing ${packagePath}...`);
  await resetNodeContainer();
  console.log(`📦 Installing dependencies for ${packagePath}...`);
  await execInNodeContainer('npm', [
    'install',
    '--registry',
    VERDACCIO_URL,
    '--prefix',
    packagePath,
    '--no-package-lock',
    '--silent',
  ]);

  console.log(`🏁 Running tests for ${packagePath}...`);
  await execInNodeContainer('npm', ['test', '--prefix', packagePath]);
}

/**
 * Remove provenance from a package.json file
 */
async function removeProvenance(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const pkg = JSON.parse(content);
  if (pkg.publishConfig?.provenance) {
    delete pkg.publishConfig.provenance;
    await writeFile(filePath, JSON.stringify(pkg, null, 2) + '\n');
  }
}

/**
 * Verify that Docker is available and ready to be used
 */
async function verifyDocker(): Promise<void> {
  console.log('🐳 Verifying Docker is available...');
  try {
    await exec('docker', ['info'], { silent: true });
    console.log('🐳 Docker is ready ✅');
  } catch {
    throw new Error('Docker is not available. Please ensure Docker is installed and running.');
  }
}

/**
 * Stop and remove the Docker Compose services
 */
async function cleanDockerCompose(): Promise<void> {
  console.log('🧹 Cleaning up Docker Compose services...');
  try {
    await exec('docker compose', ['-f', COMPOSE_FILE, 'down', '-v'], { silent: true });
  } catch {
    // Ignore errors during cleanup
  }
}

/**
 * List all package.json files in the packages directory
 */
async function listPackageJsons(directory: string): Promise<string[]> {
  const output = await execCapture('find', [directory, '-name', 'package.json']);
  return output
    .split('\n')
    .filter((f) => f.trim())
    .map((f) => path.join(PWD, f));
}

/**
 * Start Docker Compose services and wait for them to be ready
 */
async function startDockerCompose(): Promise<void> {
  await cleanDockerCompose();
  console.log('🐳 Starting Docker Compose services...');
  await exec('docker compose', ['-f', COMPOSE_FILE, 'up', '-d', '--wait']);
  console.log('🐳 Docker Compose services are ready ✅');
}
