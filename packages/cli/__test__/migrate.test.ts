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

  // Create the transformer once for all tests
  const codeTransformer = new CodeTransformer(parse, traverse, generate, new ImportManager());

  // Test each case individually
  testCases.forEach(({ name, description }) => {
    test(`Migrate: ${description}`, () => {
      try {
        // Try to load the individual test case
        const inputPath = path.join(__dirname, `./assets/cases/${name}-input.ts.txt`);

        // Read the input
        const input = fs.readFileSync(inputPath, 'utf8');

        console.log(input);

        // Run the migration
        const result = codeTransformer.transformCode(input);

        // Save actual output for debug purposes
        const debugDir = path.join(__dirname, './assets/debug');

        fs.writeFileSync(path.join(debugDir, `${name}-actual.ts.txt`), result.code);

        expect(result.code).toMatchSnapshot();

        // Verify key transformations
        expect(result.modified).toBe(true);

        // Check for key transformations
        expect(result.code).toContain('@suites/unit');
        expect(result.code).not.toContain('@automock/jest');
        expect(result.code).not.toContain('@automock/core');
        expect(result.code).not.toContain('TestBed.create');
        expect(result.code).toContain('TestBed.solitary');
        expect(result.code).toContain('async ');
        expect(result.code).toContain('await');
        expect(result.code).not.toContain('.using');
        expect(result.code).not.toContain('jest.fn()');

        // Check for any remaining jest.Mocked
        expect(result.code.includes('jest.Mocked')).toBe(false);

        // Make sure we have either impl or final
        if (input.includes('.using')) {
          expect(result.code.includes('.impl') || result.code.includes('.final')).toBe(true);
        }
      } catch (error) {
        console.error(`Error in test case "${name}":`, error);
        throw error;
      }
    });
  });
});
