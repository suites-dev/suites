import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import { CodeTransformer } from '../src/commands/migration/code-transformer';
import * as fs from 'fs';
import * as path from 'path';
import { ImportManager } from '../src/commands/migration/import-handler';

describe('Code Migrator Test', () => {
  const testCases = [
    {
      name: 'basic',
      description: 'Basic TestBed setup with beforeAll',
    },
    {
      name: 'lifecycle',
      description: 'TestBed with different lifecycle methods',
    },
    {
      name: 'arrow-function',
      description: 'Using arrow functions with TestBed',
    },
    {
      name: 'arrow-function-sinon',
      description: 'Using arrow functions with TestBed and Sinon',
    },
    {
      name: 'nested-functions',
      description: 'Using nested functions with TestBed',
    },
    {
      name: 'conditional-mocks',
      description: 'Using conditional mock implementations',
    },
    {
      name: 'multiple-patterns',
      description: 'Multiple TestBed usage patterns',
    },
    {
      name: 'object-destructuring',
      description: 'Object shorthand destructuring with TestBed',
    },
    {
      name: 'comprehensive',
      description: 'Comprehensive test including all cases',
    },
  ];

  const codeTransformer = new CodeTransformer(parse, traverse, generate, new ImportManager());

  testCases.forEach(({ name, description }) => {
    test(`Migrate: ${description}`, async () => {
      const inputPath = path.join(__dirname, `./assets/cases/${name}-input.ts.txt`);
      const input = fs.readFileSync(inputPath, 'utf8');

      const result = await codeTransformer.transformCode(input);

      expect(result.code).toMatchSnapshot();
      expect(result.modified).toBe(true);

      expect(result.code).toContain('@suites/unit');
      expect(result.code).not.toContain('@automock/jest');
      expect(result.code).not.toContain('@automock/sinon');
      expect(result.code).not.toContain('@automock/core');
      expect(result.code).not.toContain('TestBed.create');
      expect(result.code).toContain('TestBed.solitary');
      expect(result.code).toContain('async ');
      expect(result.code).toContain('await');
      expect(result.code).not.toContain('.using');
      expect(result.code).not.toContain('jest.fn()');
      expect(result.code.includes('jest.Mocked')).toBe(false);
      expect(result.code.includes('SinonStubbedInstance')).toBe(false);

      if (input.includes('.using')) {
        expect(result.code.includes('.impl') || result.code.includes('.final')).toBe(true);
      }
    });
  });
});
