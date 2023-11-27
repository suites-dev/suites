import { AutomockAdapter } from '../src';
import {
  CannotFindEntryProcessError,
  CannotFindPackageJsonError,
  CannotParsePackageJsonError,
} from '../src/services/errors';
import { PackageReader } from '../src/services/package-reader';
import { NodeRequire } from '../src/services/types';
import * as fs from 'fs';
import path from 'path';
import Mocked = jest.Mocked;

describe('Automock Adapter Package Resolving Integration Test', () => {
  let packageReader: PackageReader;
  let path: Mocked<path.PlatformPath>;
  let fileSystem: Mocked<typeof fs>;

  describe('Resolving an adapter with default export', () => {
    describe.each([[AutomockAdapter.NestJS], [AutomockAdapter.Inversify]])(
      'When adapter %s is available',
      (adapterName) => {
        let automockPackageConfig: AutomockAdapter | undefined;
        let adapters: Record<AutomockAdapter, string>;
        let require: NodeRequire;

        beforeEach(() => {
          require = {
            resolve: jest.fn(),
            require: jest.fn(),
            main: {
              filename: 'test',
            },
          } as never;

          path = {
            dirname: jest.fn(),
            join: jest.fn(),
          } as never;

          fileSystem = {
            existsSync: jest.fn(),
            readFileSync: jest.fn(),
          } as never;

          adapters = {
            [adapterName]: `@automock/adapters.${adapterName}`,
          };
          packageReader = new PackageReader(adapters, require, path, fileSystem);

          path.dirname.mockReturnValueOnce('mock-package.json');
          fileSystem.existsSync.mockReturnValueOnce(true);
          fileSystem.readFileSync.mockReturnValueOnce(
            Buffer.from(
              JSON.stringify({
                dependencies: {
                  [adapters[adapterName]]: 'version.10',
                },
              })
            )
          );

          automockPackageConfig = packageReader.resolveAutomockAdapter();
        });

        it(`should successfully resolve the adapter`, () => {
          expect(automockPackageConfig).toEqual(
            `${require.main?.filename}/${adapters[adapterName]}`
          );
        });
      }
    );
  });

  describe('Resolving adapter with no dependencies', () => {
    let automockPackageConfig: AutomockAdapter | undefined;
    let adapters: Record<AutomockAdapter, string>;
    let require: NodeRequire;

    beforeEach(() => {
      require = {
        resolve: jest.fn(),
        require: jest.fn(),
        main: {
          filename: 'test',
        },
      } as never;

      path = {
        dirname: jest.fn(),
        join: jest.fn(),
      } as never;

      fileSystem = {
        existsSync: jest.fn(),
        readFileSync: jest.fn(),
      } as never;
      path.dirname.mockReturnValueOnce('mock-package.json');
      fileSystem.existsSync.mockReturnValueOnce(true);

      adapters = {
        adapterName: `@automock/adapters.adapterName`,
      };
      packageReader = new PackageReader(adapters, require, path, fileSystem);

      fileSystem.readFileSync.mockReturnValueOnce(
        Buffer.from(
          JSON.stringify({
            dependencies: {
              ['nonResolvableAdapterName']: '0.0.0',
            },
          })
        )
      );

      automockPackageConfig = packageReader.resolveAutomockAdapter();
    });

    it('Should not resolve the adapter', () => {
      expect(automockPackageConfig).not.toBeDefined();
    });
  });

  describe('Resolving a non existing package JSON', () => {
    let require: NodeRequire;

    beforeEach(() => {
      require = {
        resolve: jest.fn(),
        require: jest.fn(),
        main: {
          filename: 'test',
        },
      } as never;

      path = {
        dirname: jest.fn(),
        join: jest.fn(),
      } as never;

      fileSystem = {
        existsSync: jest.fn(),
      } as never;

      path.dirname.mockReturnValueOnce('mock-package.json');
      fileSystem.existsSync.mockReturnValueOnce(false);

      packageReader = new PackageReader({}, require, path, fileSystem);
    });

    it('Should throw an error', () => {
      expect(() => packageReader.resolveAutomockAdapter()).toThrowError(
        new CannotFindPackageJsonError(
          `Failed to find the package.json file. Please check for potential issues in the application's configuration or setup.`
        )
      );
    });
  });

  describe('Cannot parse package JSON', () => {
    let adapters: Record<AutomockAdapter, string>;
    let require: NodeRequire;
    let mockParsingError: Error;

    beforeEach(() => {
      require = {
        resolve: jest.fn(),
        require: jest.fn(),
        main: {
          filename: 'test',
        },
      } as never;

      path = {
        dirname: jest.fn(),
        join: jest.fn(),
      } as never;

      fileSystem = {
        existsSync: jest.fn(),
        readFileSync: jest.fn(),
      } as never;

      mockParsingError = new Error('Mock Parsing Error');
      adapters = {
        adapterName: `@automock/adapters.adapterName`,
      };

      path.dirname.mockReturnValueOnce('mock-package.json');
      fileSystem.existsSync.mockReturnValueOnce(true);
      fileSystem.readFileSync.mockImplementationOnce(() => {
        throw mockParsingError;
      });

      packageReader = new PackageReader(adapters, require, path, fileSystem);
    });

    it('Should throw an error', () => {
      expect(() => packageReader.resolveAutomockAdapter()).toThrowError(
        new CannotParsePackageJsonError(
          `Failed to parse the package.json file. Reason: ${mockParsingError}`
        )
      );
    });
  });

  describe('When entry process is not defined', () => {
    let require: NodeRequire;

    beforeEach(() => {
      require = {
        resolve: jest.fn(),
        require: jest.fn(),
        main: undefined,
      } as never;

      path = {
        dirname: jest.fn(),
        join: jest.fn(),
      } as never;

      fileSystem = {
        existsSync: jest.fn(),
        readFileSync: jest.fn(),
      } as never;

      packageReader = new PackageReader({}, require, path, fileSystem);
    });

    it('Should throw an error', () => {
      expect(() => packageReader.resolveAutomockAdapter()).toThrowError(
        new CannotFindEntryProcessError(
          `An error occurred while attempting to find the entry process for the application. Please check for potential issues in the application's configuration or setup.`
        )
      );
    });
  });
});
