import * as fs from 'fs';
import * as path from 'path';
import { AutomockAdapter } from '../src';
import { PackageReader } from '../src/services/package-reader';
import {
  AdapterResolvingFailure,
  AdapterResolvingFailureReason,
  NodeRequire,
} from '../src/services/types';

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
          expect(automockPackageConfig).toEqual(adapters[adapterName].split('.')[1]);
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
        new AdapterResolvingFailure(AdapterResolvingFailureReason.CAN_NOT_FIND_PACKAGE_JSON)
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
        new AdapterResolvingFailure(AdapterResolvingFailureReason.CAN_NOT_PARSE_PACKAGE_JSON)
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
        new AdapterResolvingFailure(AdapterResolvingFailureReason.CAN_NOT_FIND_ENTRY_PROCESS)
      );
    });
  });
});
