import type { Node, NodePath } from '@babel/traverse';
import traverse from '@babel/traverse';
import type { parse, ParserOptions } from '@babel/parser';
import type generate from '@babel/generator';
import type {
  ArrowFunctionExpression,
  CallExpression,
  File,
  FunctionExpression,
  ImportDeclaration,
  ObjectProperty,
  TSTypeReference,
} from '@babel/types';
import {
  arrowFunctionExpression,
  awaitExpression,
  callExpression,
  identifier,
  isArrowFunctionExpression,
  isCallExpression,
  isFunctionExpression,
  isIdentifier,
  isMemberExpression,
  objectExpression,
  objectProperty,
} from '@babel/types';
import type { ImportManager } from './import-handler';

export class CodeTransformer {
  private readonly LIFECYCLE_METHODS = [
    'it',
    'test',
    'before',
    'after',
    'beforeAll',
    'beforeEach',
    'afterAll',
    'afterEach',
  ];

  constructor(
    private readonly parser: typeof parse,
    private readonly traverser: typeof traverse,
    private readonly generator: typeof generate,
    private readonly importManager: ImportManager
  ) {}

  public transformCode(code: string): { code: string; modified: boolean } {
    const options: ParserOptions = {
      sourceType: 'module',
      plugins: ['typescript'],
    };
    const file: File = this.parser(code, options) as File;

    // Keep track of all functions that contain TestBed calls
    const functionsWithTestBed = new Set();

    // Keep track of all compile calls to be awaited
    const compileCallsToAwait = new Map();

    // Keep track of all TestBed.solitary calls to be awaited
    const solitaryCallsToAwait = new Map();

    // Step 1: Process imports
    this.traverser(file as Node, {
      ImportDeclaration: (path: NodePath<ImportDeclaration>) => {
        this.importManager.manageImports(path, true);
      },
      TSImportEqualsDeclaration: (path: NodePath) => {
        if (
          path.isTSImportEqualsDeclaration() &&
          path.node.moduleReference.type === 'TSQualifiedName' &&
          path.node.moduleReference.left.name === 'jest' &&
          path.node.moduleReference.right.name === 'Mocked'
        ) {
          path.remove();
        }
      },
    });

    // Step 2: Replace TestBed.create with TestBed.solitary
    // and find TestBed.create/solitary calls to make async
    this.traverser(file as Node, {
      MemberExpression: (path: NodePath) => {
        if (
          isIdentifier(path.node.object) &&
          path.node.object.name === 'TestBed' &&
          isIdentifier(path.node.property) &&
          path.node.property.name === 'create'
        ) {
          path.node.property = identifier('solitary');

          // Identify the parent call expression for TestBed.solitary
          const parentCallExpr = path.findParent((p) => p.isCallExpression());
          if (parentCallExpr) {
            const functionParent = parentCallExpr.getFunctionParent();
            if (functionParent) {
              functionsWithTestBed.add(functionParent.node);
              // Mark the TestBed.solitary call for adding await
              solitaryCallsToAwait.set(parentCallExpr.node, parentCallExpr);
            }
          }
        } else if (
          isIdentifier(path.node.object) &&
          path.node.object.name === 'TestBed' &&
          isIdentifier(path.node.property) &&
          path.node.property.name === 'solitary'
        ) {
          // Also find existing TestBed.solitary calls (for idempotency)
          const parentCallExpr = path.findParent((p) => p.isCallExpression());
          if (parentCallExpr) {
            const functionParent = parentCallExpr.getFunctionParent();
            if (functionParent) {
              functionsWithTestBed.add(functionParent.node);
              // Mark the TestBed.solitary call for adding await
              solitaryCallsToAwait.set(parentCallExpr.node, parentCallExpr);
            }
          }
        } else if (
          isIdentifier(path.node.object) &&
          path.node.object.name === 'jest' &&
          isIdentifier(path.node.property) &&
          path.node.property.name === 'Mocked'
        ) {
          // Replace jest.Mocked with Mocked in member expressions
          path.replaceWith(identifier('Mocked'));
        }
      },
    });

    // Step 3: Scan for TestBed.compile calls and their containing functions
    this.traverser(file as Node, {
      CallExpression: (path: NodePath<CallExpression>) => {
        if (
          isMemberExpression(path.node.callee) &&
          isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'compile'
        ) {
          // Find containing function for compile() calls
          const functionParent = path.getFunctionParent();
          if (functionParent) {
            functionsWithTestBed.add(functionParent.node);
            // Mark the compile call for adding await
            compileCallsToAwait.set(path.node, path);
          }
        }

        // Replace jest.fn() with stubFn()
        if (
          isMemberExpression(path.node.callee) &&
          isIdentifier(path.node.callee.object) &&
          path.node.callee.object.name === 'jest' &&
          isIdentifier(path.node.callee.property) &&
          path.node.callee.property.name === 'fn'
        ) {
          path.replaceWith(callExpression(identifier('stubFn'), []));
        }
      },

      // Transform .using() to .final() or .impl()
      MemberExpression: (path: NodePath) => {
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
            }
          }
        }
      },

      // For TypeScript type references like jest.Mocked<T>
      TSTypeReference: (path: NodePath<TSTypeReference>) => {
        const typeName = path.node.typeName;
        if (
          typeName.type === 'TSQualifiedName' &&
          typeName.left.type === 'Identifier' &&
          typeName.left.name === 'jest' &&
          typeName.right.type === 'Identifier' &&
          typeName.right.name === 'Mocked'
        ) {
          path.node.typeName = identifier('Mocked');
        }
      },
    });

    // Step 4: Make all test lifecycle methods async
    this.traverser(file as Node, {
      CallExpression: (path: NodePath<CallExpression>) => {
        if (
          isIdentifier(path.node.callee) &&
          this.LIFECYCLE_METHODS.includes(path.node.callee.name) &&
          path.node.arguments.length >= 2
        ) {
          // Make the callback function async
          const callback = path.node.arguments[1];
          if (isArrowFunctionExpression(callback) && !callback.async) {
            callback.async = true;
          } else if (isFunctionExpression(callback) && !callback.async) {
            callback.async = true;
          }
        }
      },
    });

    // Step 5: Make functions async and add await to TestBed.solitary and compile calls
    this.traverser(file as Node, {
      // Make functions async
      ArrowFunctionExpression: (path: NodePath<ArrowFunctionExpression>) => {
        if (functionsWithTestBed.has(path.node) && !path.node.async) {
          path.node.async = true;
        }
      },

      FunctionExpression: (path: NodePath<FunctionExpression>) => {
        if (functionsWithTestBed.has(path.node) && !path.node.async) {
          path.node.async = true;
        }
      },

      // Add await to TestBed.solitary calls
      CallExpression: (path: NodePath<CallExpression>) => {
        if (
          solitaryCallsToAwait.has(path.node) &&
          !this.isAlreadyAwaited(path) &&
          path.parent.type !== 'MemberExpression'
        ) {
          // Only add await if this is not part of a method chain
          path.replaceWith(awaitExpression(path.node));
        }

        // Add await to compile() calls
        if (compileCallsToAwait.has(path.node) && !this.isAlreadyAwaited(path)) {
          path.replaceWith(awaitExpression(path.node));
        }
      },
    });

    // Generate the code with the transformations
    const result = this.generator(
      file,
      {
        retainLines: false,
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
    ).code;

    // Check if there are still any jest.Mocked references
    if (result.includes('jest.Mocked')) {
      // Fix with string replacement as a fallback
      const finalCode = result.replace(/jest\.Mocked<([^>]+)>/g, 'Mocked<$1>');
      return {
        code: finalCode,
        modified: true,
      };
    }

    return {
      code: result,
      modified: true,
    };
  }

  /**
   * Check if the expression is already awaited
   */
  private isAlreadyAwaited(path: NodePath): boolean {
    const parent = path.parentPath;
    return parent && parent.isAwaitExpression();
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
