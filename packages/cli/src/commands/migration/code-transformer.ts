import type { parse } from '@babel/parser';
import type { Node, NodePath } from '@babel/traverse';
import type traverse from '@babel/traverse';
import type generate from '@babel/generator';
import type {
  CallExpression,
  File,
  Identifier,
  ImportDeclaration,
  MemberExpression,
} from '@babel/types';
import {
  awaitExpression,
  identifier,
  isArrowFunctionExpression,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isMemberExpression,
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

    const file: File = this.parser(code, {
      sourceType: 'module',
      plugins: ['typescript'],
    }) as File;

    this.traverser(file as Node, {
      ImportDeclaration: (path: NodePath<ImportDeclaration>) => {
        modified = this.importManager.manageImports(path, modified);
      },
      MemberExpression: (path: NodePath<MemberExpression>) => {
        // Check if the object is 'TestBed' and the method called is 'create'
        if (
          isIdentifier(path.node.object) &&
          path.node.object.name === 'TestBed' &&
          isIdentifier(path.node.property) &&
          path.node.property.name === 'create'
        ) {
          // Change 'create' to 'solitary'
          path.node.property = identifier('solitary');
          modified = true;

          // Find the topmost CallExpression in the chain ending with 'compile'
          let callExpPath = path.findParent((p) =>
            p.isCallExpression()
          ) as NodePath<CallExpression>;
          while (
            (callExpPath && !isMemberExpression(callExpPath.node.callee)) ||
            (isMemberExpression(callExpPath.node.callee) &&
              ((callExpPath.node.callee as MemberExpression).property as Identifier).name !==
                'compile')
          ) {
            callExpPath = callExpPath.findParent((p) =>
              p.isCallExpression()
            ) as NodePath<CallExpression>;
          }

          if (
            callExpPath &&
            isMemberExpression(callExpPath.node.callee) &&
            ((callExpPath.node.callee as MemberExpression).property as Identifier).name ===
              'compile'
          ) {
            const expression = awaitExpression(callExpPath.node);
            callExpPath.replaceWith(expression as Node);

            // Ensure the enclosing function is marked as async
            const functionPath = callExpPath.findParent((p) => p.isFunction());

            if (
              functionPath &&
              (isFunctionDeclaration(functionPath.node) ||
                isFunctionExpression(functionPath.node) ||
                isArrowFunctionExpression(functionPath.node))
            ) {
              functionPath.node.async = true;
            }
          }
        }
      },
    });

    const output = this.generator(
      file as Node,
      {
        retainLines: true,
        concise: false,
        compact: false,
        minified: false,
        jsescOption: {
          minimal: true,
        },
        shouldPrintComment: () => true,
      },
      code
    );

    return { code: output.code, modified };
  }
}
