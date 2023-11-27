import { AutomockAdapter } from '../main';
import {
  CannotFindEntryProcessError,
  CannotFindPackageJsonError,
  CannotParsePackageJsonError,
} from './errors';
import { NodeRequire } from './types';
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
    const packageJsonContent = this.findAutomockAdapter();
    if (packageJsonContent?.endsWith('undefined')) {
      return undefined;
    }
    return packageJsonContent;
  }

  private getDependenciesFromPackageJson(): PackageJson | never {
    if (this.require!.main === undefined) {
      throw new CannotFindEntryProcessError(
        `An error occurred while attempting to find the entry process for the application. Please check for potential issues in the application's configuration or setup.`
      );
    }

    const currentDirPath = this.path.dirname(this.require.main.filename);
    const projectPath = currentDirPath.match(/^(.*?)(?:\/node_modules|$)/)?.at(1) || '';
    const packageJsonPath = this.path.join(projectPath, 'package.json');

    if (this.fs.existsSync(packageJsonPath)) {
      let packageJson;
      try {
        packageJson = JSON.parse(this.fs.readFileSync(packageJsonPath, 'utf8'));
      } catch (error) {
        throw new CannotParsePackageJsonError(
          `Failed to parse the package.json file. Reason: ${error}`
        );
      }
      return {
        dependencies: Object.keys(packageJson?.dependencies || {}),
        devDependencies: Object.keys(packageJson?.devDependencies || {}),
      };
    }

    throw new CannotFindPackageJsonError(
      `Failed to find the package.json file. Please check for potential issues in the application's configuration or setup.`
    );
  }

  private findAutomockAdapter(): AutomockAdapter | undefined {
    const packageJsonDependencies = this.getDependenciesFromPackageJson();
    const mergedDependencies = [
      ...packageJsonDependencies.dependencies,
      ...packageJsonDependencies.devDependencies,
    ];
    const foundAdapter = Object.values(this.adapters).find((adapter: AutomockAdapter) =>
      mergedDependencies.includes(adapter)
    );

    return `${this.require!.main!.filename}/${foundAdapter}`;
  }
}

interface PackageJson {
  dependencies: string[];
  devDependencies: string[];
}
type FileSystem = typeof fs;
