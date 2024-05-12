import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import { CodeTransformer } from '../src/commands/migration/code-transformer';
import * as fs from 'fs';
import * as path from 'path';
import { ImportManager } from '../src/commands/migration/import-handler';

describe('Code Migrator Integration Test', () => {
  let codeTransformer: CodeTransformer;

  beforeAll(() => {
    codeTransformer = new CodeTransformer(parse, traverse, generate, new ImportManager());
  });

  test('migrate', () => {
    const code = fs.readFileSync(path.join(__dirname, './assets/spec-example.ts.txt'), 'utf8');
    const result = codeTransformer.transformCode(code);

    expect(result.modified).toBe(true);
    expect(result.code).toMatchSnapshot();
  });
});
