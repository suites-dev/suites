import type { Node, NodePath } from '@babel/traverse';
import traverse from '@babel/traverse';
import type { parse, ParserOptions } from '@babel/parser';
import type generate from '@babel/generator';
import type { File, ObjectProperty, CallExpression, ImportDeclaration } from '@babel/types';
import {
  isIdentifier,
  identifier,
  isCallExpression,
  isMemberExpression,
  arrowFunctionExpression,
  callExpression,
  objectExpression,
  objectProperty,
} from '@babel/types';
import type { ImportManager } from './import-handler';

export class CodeTransformer {
  constructor(
    private readonly parser: typeof parse,
    private readonly traverser: typeof traverse,
    private readonly generator: typeof generate,
    private readonly importManager: ImportManager
  ) {}

  public transformCode(code: string): { code: string; modified: boolean } {
    let modified = false;
    const options: ParserOptions = {
      sourceType: 'module',
      plugins: ['typescript'],
    };
    const file: File = this.parser(code, options) as File;

    this.traverser(file as Node, {
      ImportDeclaration: (path: NodePath<ImportDeclaration>) => {
        modified = this.importManager.manageImports(path, modified);
      },
      TSImportEqualsDeclaration: (path: NodePath) => {
        if (path.isTSImportEqualsDeclaration()) {
          if (
            path.node.moduleReference.type === 'TSQualifiedName' &&
            path.node.moduleReference.left.name === 'jest' &&
            path.node.moduleReference.right.name === 'Mocked'
          ) {
            path.remove();
            modified = true;
          }
        }
      },
      CallExpression: (path: NodePath<CallExpression>) => {
        this.replaceJestFnWithStubFn(path, modified);
      },
      MemberExpression: (path: NodePath) => {
        this.handleTestBedMethodNames(path, modified);
        this.handleMockMethodNames(path, modified);
      },
    });

    const output = this.generator(
      file,
      {
        retainLines: true,
        concise: false,
        comments: true,
        compact: false,
        minified: false,
        format: {
          indent: {
            adjustMultilineComment: true,
            style: '  ', // Use two spaces for indentation
            base: 0,
          },
        },
      },
      code
    );

    return { code: output.code, modified };
  }

  private handleTestBedMethodNames(path: NodePath, modified: boolean): void {
    if (
      isIdentifier(path.node.object) &&
      path.node.object.name === 'TestBed' &&
      isIdentifier(path.node.property) &&
      path.node.property.name === 'create'
    ) {
      path.node.property = identifier('solitary');
      modified = true;
    }
  }

  private handleMockMethodNames(path: NodePath, modified: boolean): void {
    if (
      isMemberExpression(path.node) &&
      isIdentifier(path.node.property) &&
      path.node.property.name === 'using'
    ) {
      const mockCallExpression = path.findParent((p) =>
        p.isCallExpression()
      ) as NodePath<CallExpression>;
      if (mockCallExpression && mockCallExpression.node.arguments.length > 0) {
        const arg = mockCallExpression.node.arguments[0];
        const isStub = this.containsStub(arg);

        const newMethod = isStub ? 'impl' : 'final';
        path.node.property.name = newMethod;

        if (isStub) {
          const stubFunction = arrowFunctionExpression(
            [identifier('stubFn')],
            objectExpression(this.createStubReplacements(arg))
          );
          mockCallExpression.node.arguments = [stubFunction];
        } else {
          mockCallExpression.node.arguments = [arg];
        }
        modified = true;
      }
    }
  }

  private replaceJestFnWithStubFn(path: NodePath<CallExpression>, modified: boolean): void {
    if (
      isCallExpression(path.node) &&
      isMemberExpression(path.node.callee) &&
      isIdentifier(path.node.callee.property) &&
      path.node.callee.property.name === 'fn'
    ) {
      path.replaceWith(callExpression(identifier('stubFn'), []));
      modified = true;
      this.transformMockResolvedValue(path.parentPath as NodePath<CallExpression>, modified);
    }
  }

  private transformMockResolvedValue(path: NodePath<CallExpression>, modified: boolean): void {
    if (path && isCallExpression(path.node)) {
      const parentCall = path.node;
      if (
        isMemberExpression(parentCall.callee) &&
        isIdentifier(parentCall.callee.property) &&
        parentCall.callee.property.name === 'mockResolvedValue'
      ) {
        const mockResolvedValueArg = parentCall.arguments[0];
        path.replaceWith(
          callExpression(identifier('mockResolvedValue'), [
            callExpression(identifier('stubFn'), []),
            mockResolvedValueArg,
          ])
        );
        modified = true;
      }
    }
  }

  private containsStub(node: Node): boolean {
    let hasStub = false;
    traverse(
      node,
      {
        CallExpression(path) {
          if (
            isMemberExpression(path.node.callee) &&
            isIdentifier(path.node.callee.object) &&
            path.node.callee.object.name === 'jest' &&
            isIdentifier(path.node.callee.property) &&
            path.node.callee.property.name === 'fn'
          ) {
            hasStub = true;
            path.stop();
          }
        },
      },
      {
        noScope: true,
      }
    );
    return hasStub;
  }

  private createStubReplacements(arg: Node): ObjectProperty[] {
    const replacements: ObjectProperty[] = [];
    traverse(
      arg,
      {
        ObjectProperty(path) {
          if (
            isCallExpression(path.node.value) &&
            isMemberExpression(path.node.value.callee) &&
            isIdentifier(path.node.value.callee.object) &&
            path.node.value.callee.object.name === 'jest' &&
            isIdentifier(path.node.value.callee.property) &&
            path.node.value.callee.property.name === 'fn'
          ) {
            let replacementExp = callExpression(identifier('stubFn'), []);
            let currentExp = path.node.value.callee;

            while (isMemberExpression(currentExp) && isCallExpression(currentExp.object)) {
              if (isIdentifier(currentExp.property)) {
                replacementExp = callExpression(identifier(currentExp.property.name), [
                  replacementExp,
                  ...currentExp.object.arguments,
                ]);
              }
              currentExp = currentExp.object;
            }
            replacements.push(objectProperty(path.node.key, replacementExp));
          } else {
            replacements.push(path.node);
          }
        },
      },
      {
        noScope: true,
      }
    );

    return replacements;
  }
}
