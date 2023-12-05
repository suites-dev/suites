import path from 'path';
import * as fs from 'fs';
import {
  AdapterResolutionFailureReason,
  AdapterResolutionFailure,
  NodeRequire,
  AutomockAdapter,
} from './types';

type FileSystem = typeof fs;

interface PackageJsonDependencies {
  dependencies: string[];
  devDependencies: string[];
}

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

    let adapterName: string | undefined;
    const match = foundAdapter.match(/\.([^\.]+)$/);
    if (match) {
      adapterName = match[1];
    }
    return adapterName;
  }

  private getDependenciesFromPackageJson(): PackageJsonDependencies | never {
    if (this.require!.main === undefined) {
      throw new AdapterResolutionFailure(AdapterResolutionFailureReason.CANNOT_FIND_ENTRY_PROCESS);
    }

    const currentDirPath = this.path.dirname(this.require.main.filename);
    const projectPath = currentDirPath.match(/^(.*?)(?:\/node_modules|$)/)?.at(1) || '';
    const packageJsonPath = this.path.join(projectPath, 'package.json');

    if (this.fs.existsSync(packageJsonPath)) {
      let packageJson;

      try {
        packageJson = JSON.parse(this.fs.readFileSync(packageJsonPath, 'utf8'));
      } catch (error) {
        throw new AdapterResolutionFailure(
          AdapterResolutionFailureReason.CANNOT_PARSE_PACKAGE_JSON
        );
      }

      return {
        dependencies: Object.keys(packageJson?.dependencies || {}),
        devDependencies: Object.keys(packageJson?.devDependencies || {}),
      };
    }

    throw new AdapterResolutionFailure(AdapterResolutionFailureReason.CANNOT_FIND_PACKAGE_JSON);
  }
}
