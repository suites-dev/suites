import { AutomockAdapter } from '../main';
import { AdapterResolvingFailureReason, AdapterResolvingFailure, NodeRequire } from './types';
import path from 'path';
import * as fs from 'fs';

export class PackageReader {
  public constructor(
    private readonly adapters: Record<AutomockAdapter, string>,
    private readonly require: NodeRequire,
    private readonly path: path.PlatformPath,
    private readonly fs: FileSystem
  ) {}

  public resolveAutomockAdapter(): AutomockAdapter | undefined {
    return this.findAutomockAdapter();
  }

  private findAutomockAdapter(): AutomockAdapter | undefined {
    const packageJsonDependencies = this.getDependenciesFromPackageJson();
    const mergedDependencies = [
      ...packageJsonDependencies.dependencies,
      ...packageJsonDependencies.devDependencies,
    ];

    const foundAdapter = Object.values(this.adapters).find((adapter) =>
      mergedDependencies.includes(adapter)
    );

    if (typeof foundAdapter === 'undefined') {
      return undefined;
    }

    return foundAdapter.split('.')[1]; //regex
  }

  private getDependenciesFromPackageJson(): PackageJson | never {
    if (this.require!.main === undefined) {
      throw new AdapterResolvingFailure(AdapterResolvingFailureReason.CAN_NOT_FIND_ENTRY_PROCESS);
    }

    const currentDirPath = this.path.dirname(this.require.main.filename);
    const projectPath = currentDirPath.match(/^(.*?)(?:\/node_modules|$)/)?.at(1) || '';
    const packageJsonPath = this.path.join(projectPath, 'package.json');

    if (this.fs.existsSync(packageJsonPath)) {
      let packageJson;

      try {
        packageJson = JSON.parse(this.fs.readFileSync(packageJsonPath, 'utf8'));
      } catch (error) {
        throw new AdapterResolvingFailure(AdapterResolvingFailureReason.CAN_NOT_PARSE_PACKAGE_JSON);
      }

      return {
        dependencies: Object.keys(packageJson?.dependencies || {}),
        devDependencies: Object.keys(packageJson?.devDependencies || {}),
      };
    }

    throw new AdapterResolvingFailure(AdapterResolvingFailureReason.CAN_NOT_FIND_PACKAGE_JSON);
  }
}

interface PackageJson {
  dependencies: string[];
  devDependencies: string[];
}

type FileSystem = typeof fs;
