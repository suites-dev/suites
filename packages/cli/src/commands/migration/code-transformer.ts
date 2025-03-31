import type traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import type { parse, ParserOptions } from '@babel/parser';
import type generate from '@babel/generator';
import type {
  ArrowFunctionExpression,
  CallExpression,
  File,
  FunctionExpression,
  Identifier,
  ImportDeclaration,
  MemberExpression,
  Node,
  ObjectProperty,
  TSImportEqualsDeclaration,
  TSTypeReference,
  ObjectExpression,
} from '@babel/types';
import {
  arrowFunctionExpression,
  awaitExpression,
  callExpression,
  identifier,
  isArrowFunctionExpression,
  isFunctionExpression,
  isIdentifier,
  isMemberExpression,
  isObjectExpression,
  isCallExpression,
  objectExpression,
  objectProperty,
} from '@babel/types';
import type { ImportManager } from './import-handler';
import * as prettier from 'prettier';

// Type augmentation for NodePath
type TypedNodePath<T> = NodePath<T>;

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

  public async transformCode(code: string): Promise<{ code: string; modified: boolean }> {
    const options: ParserOptions = {
      sourceType: 'module',
      plugins: ['typescript'],
    };
    const file = this.parser(code, options);

    // Keep track of all functions that contain TestBed calls
    const functionsWithTestBed = new Set<Node>();

    // Keep track of all compile calls to be awaited
    const compileCallsToAwait = new Map<Node, NodePath<Node>>();

    // Keep track of all TestBed.solitary calls to be awaited
    const solitaryCallsToAwait = new Map<Node, NodePath<Node>>();

    // Step 1: Process imports
    this.traverser(file, {
      ImportDeclaration: (path: TypedNodePath<ImportDeclaration>) => {
        this.importManager.manageImports(
          path as TypedNodePath<ImportDeclaration | TSImportEqualsDeclaration>,
          true
        );
      },
      TSImportEqualsDeclaration: (path: TypedNodePath<TSImportEqualsDeclaration>) => {
        const moduleRef = path.node.moduleReference;
        if (
          moduleRef.type === 'TSQualifiedName' &&
          moduleRef.left.type === 'Identifier' &&
          moduleRef.left.name === 'jest' &&
          moduleRef.right.name === 'Mocked'
        ) {
          path.remove();
        }
      },
    });

    // Step 2: Replace TestBed.create with TestBed.solitary
    // and find TestBed.create/solitary calls to make async
    this.traverser(file, {
      MemberExpression: (path: TypedNodePath<MemberExpression>) => {
        if (
          isIdentifier(path.node.object) &&
          (path.node.object as Identifier).name === 'TestBed' &&
          isIdentifier(path.node.property) &&
          (path.node.property as Identifier).name === 'create'
        ) {
          path.node.property = identifier('solitary');

          // Identify the parent call expression for TestBed.solitary
          const parentCallExpr = path.findParent((p) => p.isCallExpression());
          if (parentCallExpr) {
            const functionParent = parentCallExpr.getFunctionParent();
            if (functionParent) {
              functionsWithTestBed.add(functionParent.node);
              // Mark the TestBed.solitary call for adding await
              solitaryCallsToAwait.set(parentCallExpr.node, parentCallExpr as NodePath<Node>);
            }
          }
        } else if (
          isIdentifier(path.node.object) &&
          (path.node.object as Identifier).name === 'TestBed' &&
          isIdentifier(path.node.property) &&
          (path.node.property as Identifier).name === 'solitary'
        ) {
          // Also find existing TestBed.solitary calls (for idempotency)
          const parentCallExpr = path.findParent((p) => p.isCallExpression());
          if (parentCallExpr) {
            const functionParent = parentCallExpr.getFunctionParent();
            if (functionParent) {
              functionsWithTestBed.add(functionParent.node);
              // Mark the TestBed.solitary call for adding await
              solitaryCallsToAwait.set(parentCallExpr.node, parentCallExpr as NodePath<Node>);
            }
          }
        } else if (
          isIdentifier(path.node.object) &&
          (path.node.object as Identifier).name === 'jest' &&
          isIdentifier(path.node.property) &&
          (path.node.property as Identifier).name === 'Mocked'
        ) {
          // Replace jest.Mocked with Mocked in member expressions
          path.replaceWith(identifier('Mocked'));
        } else if (
          isIdentifier(path.node.object) &&
          (path.node.object as Identifier).name === 'sinon' &&
          isIdentifier(path.node.property) &&
          (path.node.property as Identifier).name === 'stub'
        ) {
          // Replace sinon.stub with stubFn
          path.replaceWith(identifier('stubFn'));
        }
      },
    });

    // Step 3: Scan for TestBed.compile calls and their containing functions
    this.traverser(file as File, {
      CallExpression: (path: TypedNodePath<CallExpression>) => {
        const callee = path.node.callee;
        if (
          isMemberExpression(callee) &&
          isIdentifier((callee as MemberExpression).property) &&
          ((callee as MemberExpression).property as Identifier).name === 'compile'
        ) {
          // Find containing function for compile() calls
          const functionParent = path.getFunctionParent();
          if (functionParent) {
            functionsWithTestBed.add(functionParent.node);
            // Mark the compile call for adding await
            compileCallsToAwait.set(path.node, path as NodePath<Node>);
          }
        }

        // Replace jest.fn() with stubFn()
        if (
          isMemberExpression(callee) &&
          isIdentifier((callee as MemberExpression).object) &&
          ((callee as MemberExpression).object as Identifier).name === 'jest' &&
          isIdentifier((callee as MemberExpression).property) &&
          ((callee as MemberExpression).property as Identifier).name === 'fn'
        ) {
          path.replaceWith(callExpression(identifier('stubFn'), []));
        }

        // Replace sinon.stub() with stubFn()
        if (
          isMemberExpression(callee) &&
          isIdentifier((callee as MemberExpression).object) &&
          ((callee as MemberExpression).object as Identifier).name === 'sinon' &&
          isIdentifier((callee as MemberExpression).property) &&
          ((callee as MemberExpression).property as Identifier).name === 'stub'
        ) {
          path.replaceWith(callExpression(identifier('stubFn'), []));
        }

        // Also handle direct calls to stub()
        if (
          isIdentifier(callee) &&
          (callee as Identifier).name === 'stub'
        ) {
          path.replaceWith(callExpression(identifier('stubFn'), []));
        }
      },

      // Transform .using() to .final() or .impl()
      MemberExpression: (path: TypedNodePath<MemberExpression>) => {
        if (
          isIdentifier(path.node.property) &&
          (path.node.property as Identifier).name === 'using'
        ) {
          const mockCallExpression = path.findParent((p) =>
            p.isCallExpression()
          ) as TypedNodePath<CallExpression>;

          if (mockCallExpression && mockCallExpression.node.arguments.length > 0) {
            const arg = mockCallExpression.node.arguments[0];
            
            // Check if the argument contains any stub functions
            const hasMockFunctions = this.containsStubFunction(arg);
            
            // Use impl for objects with stub functions, final for plain data
            const newMethod = hasMockFunctions ? 'impl' : 'final';
            (path.node.property as Identifier).name = newMethod;

            // Convert to the correct format
            if (hasMockFunctions) {
              // If we're using .impl(), create a proper stub function
              // Create an arrow function that receives stubFn as a parameter
              const stubFunction = arrowFunctionExpression(
                [identifier('stubFn')],
                // Return an object with a simple stub property to maintain the pattern
                objectExpression([
                  objectProperty(
                    identifier('stubProperty'),
                    callExpression(identifier('stubFn'), [])
                  )
                ])
              );
              mockCallExpression.node.arguments = [stubFunction];
            }
            // Otherwise keep the argument as is for .final()
          }
        }
      },

      // For TypeScript type references like jest.Mocked<T>
      TSTypeReference: (path: TypedNodePath<TSTypeReference>) => {
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

        // Replace SinonStubbedInstance with Mocked
        if (isIdentifier(typeName) && typeName.name === 'SinonStubbedInstance') {
          path.node.typeName = identifier('Mocked');
        }
      },
    });

    // Step 4: Make all test lifecycle methods async
    this.traverser(file as File, {
      CallExpression: (path: TypedNodePath<CallExpression>) => {
        if (
          isIdentifier(path.node.callee) &&
          this.LIFECYCLE_METHODS.includes((path.node.callee as Identifier).name) &&
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
    this.traverser(file as File, {
      // Make functions async
      ArrowFunctionExpression: (path: TypedNodePath<ArrowFunctionExpression>) => {
        if (functionsWithTestBed.has(path.node) && !path.node.async) {
          path.node.async = true;
        }
      },

      FunctionExpression: (path: TypedNodePath<FunctionExpression>) => {
        if (functionsWithTestBed.has(path.node) && !path.node.async) {
          path.node.async = true;
        }
      },

      // Add await to TestBed.solitary calls
      CallExpression: (path: TypedNodePath<CallExpression>) => {
        if (
          solitaryCallsToAwait.has(path.node) &&
          !this.isAlreadyAwaited(path as NodePath) &&
          path.parent.type !== 'MemberExpression'
        ) {
          // Only add await if this is not part of a method chain
          path.replaceWith(awaitExpression(path.node));
        }

        // Add await to compile() calls
        if (compileCallsToAwait.has(path.node) && !this.isAlreadyAwaited(path as NodePath<Node>)) {
          path.replaceWith(awaitExpression(path.node));
        }
      },
    });

    // Generate the code with the transformations
    let result = this.generator(
      file as File,
      {
        retainLines: false,
        concise: false,
        comments: true,
        compact: false,
        minified: false,
      },
      code
    ).code;

    // Check if there are still any jest.Mocked references
    if (result.includes('jest.Mocked')) {
      // Fix with string replacement as a fallback
      result = result.replace(/jest\.Mocked<([^>]+)>/g, 'Mocked<$1>');
    }

    // Replace SinonStubbedInstance with Mocked
    if (result.includes('SinonStubbedInstance')) {
      result = result.replace(/SinonStubbedInstance<([^>]+)>/g, 'Mocked<$1>');
      // Also remove any 'sinon' imports
      result = result.replace(
        /import\s+{\s*SinonStubbedInstance\s*}\s*from\s*['"]sinon['"]\s*;\n?/g,
        ''
      );
      result = result.replace(/import\s+.*\s*from\s*['"]sinon['"]\s*;\n?/g, '');
    }

    // Replace any remaining sinon references
    if (result.includes('sinon.stub')) {
      result = result.replace(/sinon\.stub\(\)/g, 'stubFn()');
      result = result.replace(/sinon\.stub/g, 'stubFn');
    }

    // Format with Prettier
    try {
      // Try to detect the user's Prettier config
      const prettierConfig = (await prettier.resolveConfig(process.cwd())) || {
        parser: 'typescript',
        printWidth: 100,
        singleQuote: true,
        trailingComma: 'es5',
        tabWidth: 2,
      };

      // Format the transformed code
      const formattedCode = await prettier.format(result, {
        ...prettierConfig,
        parser: 'typescript',
      });

      return {
        code: formattedCode,
        modified: true,
      };
    } catch (error) {
      console.warn('Failed to format with Prettier:', error);
      // Return unformatted code if Prettier fails
      return {
        code: result,
        modified: true,
      };
    }
  }

  /**
   * Check if the expression is already awaited
   */
  private isAlreadyAwaited(path: NodePath): boolean {
    const parent = path.parentPath;
    return parent ? parent.isAwaitExpression() : false;
  }

  /**
   * Check if the node contains a stub function call (stubFn, jest.fn, sinon.stub)
   * or any method calls that indicate it's a stub object
   */
  private containsStubFunction(node: Node): boolean {
    if (!node) return false;

    // Check for direct stub function calls
    if (isCallExpression(node)) {
      const callee = node.callee;
      
      // Case 1: Direct stubFn() call
      if (isIdentifier(callee) && callee.name === 'stubFn') {
        return true;
      }
      
      // Case 2: Known stub factory functions (jest.fn, sinon.stub)
      if (isMemberExpression(callee)) {
        if (isIdentifier(callee.object) && isIdentifier(callee.property)) {
          const objName = callee.object.name;
          const propName = callee.property.name;
          
          if ((objName === 'jest' && propName === 'fn') ||
              (objName === 'sinon' && propName === 'stub')) {
            return true;
          }
        }
        
        // Case 3: Method chaining on a call expression (possible stub configuration)
        // Example: stubFn().anything() or jest.fn().anything()
        if (isCallExpression(callee.object)) {
          // If we're calling a method on a call expression, it's likely a stub config
          return true;
        }
      }
    }
    
    // Case 4: Look for objects with properties that are call expressions
    // This covers cases like { method: stubFn() } or { method: jest.fn() }
    if (isObjectExpression(node)) {
      for (const prop of node.properties) {
        if (prop.type === 'ObjectProperty' && prop.value) {
          // If property value is a direct stub function or a call chain
          if (isCallExpression(prop.value)) {
            const callee = prop.value.callee;
            
            // Direct stub function calls
            if (isIdentifier(callee) && 
                (callee.name === 'stubFn' || callee.name === 'spy' || callee.name === 'stub')) {
              return true;
            }
            
            // Member expressions like jest.fn(), sinon.stub()
            if (isMemberExpression(callee) && isIdentifier(callee.object) && isIdentifier(callee.property)) {
              const objName = callee.object.name;
              const propName = callee.property.name;
              
              if ((objName === 'jest' && propName === 'fn') ||
                  (objName === 'sinon' && propName === 'stub') ||
                  (objName === 'sinon' && propName === 'spy')) {
                return true;
              }
            }
            
            // Check for method chains on potential stubs
            if (isMemberExpression(callee) && isCallExpression(callee.object)) {
              return true;
            }
          }
          
          // Recursively check nested structures
          if (this.containsStubFunction(prop.value)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Create replacements for stub properties
   * Using a simplified version that doesn't use traversal
   */
  private createStubReplacements(): ObjectProperty[] {
    // A simplified implementation since we can't use the traverser directly
    const replacements: ObjectProperty[] = [];

    // Always create a simple stub property as a fallback
    replacements.push(
      objectProperty(identifier('stubProperty'), callExpression(identifier('stubFn'), []))
    );

    return replacements;
  }
}
