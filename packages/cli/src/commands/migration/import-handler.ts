import type { NodePath } from '@babel/traverse';
import type {
  ImportDeclaration,
  ImportSpecifier,
  Program,
  TSImportEqualsDeclaration,
} from '@babel/types';
import {
  identifier,
  importDeclaration,
  importSpecifier,
  isIdentifier,
  isImportSpecifier,
  stringLiteral,
} from '@babel/types';

type TypedNodePath<T> = NodePath<T>;

export class ImportManager {
  public manageImports(
    path: TypedNodePath<ImportDeclaration | TSImportEqualsDeclaration>,
    modified: boolean
  ): boolean {
    if (path.isImportDeclaration()) {
      const source = path.node.source.value;

      // Case 1: @automock/jest or @automock/sinon to @suites/unit
      if (source === '@automock/jest' || source === '@automock/sinon') {
        path.node.source = stringLiteral('@suites/unit');

        // If any of the imports are TestBed, we need to make sure the import specifier exists
        const hasTestBed = path.node.specifiers.some(
          (specifier) =>
            isImportSpecifier(specifier) &&
            isIdentifier(specifier.imported) &&
            specifier.imported.name === 'TestBed'
        );

        if (hasTestBed) {
          modified = true;
        }
      }

      // Case 2: @automock/core to @suites/unit
      if (source === '@automock/core') {
        path.node.source = stringLiteral('@suites/unit');
        modified = true;
      }

      // Case 3: Remove sinon imports or replace with @suites/unit if they have SinonStubbedInstance
      if (source === 'sinon') {
        const hasSinonStubbedInstance = path.node.specifiers.some(
          (specifier) =>
            isImportSpecifier(specifier) &&
            isIdentifier(specifier.imported) &&
            specifier.imported.name === 'SinonStubbedInstance'
        );

        if (hasSinonStubbedInstance) {
          // Find the import for @suites/unit or create it if it doesn't exist
          const programPath = this.findProgramPath(path);

          if (programPath) {
            // First check if we already have an import from @suites/unit
            let hasUnitImport = false;

            programPath.node.body.forEach((node) => {
              if (node.type === 'ImportDeclaration' && node.source.value === '@suites/unit') {
                hasUnitImport = true;

                // Check if Mocked is already imported
                const importMocked = node.specifiers.some(
                  (spec) =>
                    isImportSpecifier(spec) &&
                    isIdentifier(spec.imported) &&
                    spec.imported.name === 'Mocked'
                );

                if (!importMocked) {
                  // Add Mocked import to existing @suites/unit import
                  node.specifiers.push(importSpecifier(identifier('Mocked'), identifier('Mocked')));
                  // Add type keyword
                  const lastSpecifier = node.specifiers[node.specifiers.length - 1];
                  if (isImportSpecifier(lastSpecifier)) {
                    lastSpecifier.importKind = 'type';
                  }
                }
              }
            });

            // If no import from @suites/unit exists, create one with Mocked
            if (!hasUnitImport) {
              const newImport = importDeclaration(
                [this.createTypedMockedImportSpecifier()],
                stringLiteral('@suites/unit')
              );
              programPath.node.body.unshift(newImport);
            }

            // Combine multiple imports from @suites/unit
            this.combineImports(programPath, '@suites/unit');
          }

          // Now remove the sinon import completely
          path.remove();
          modified = true;
        } else {
          // Just a regular sinon import - we need to add stubFn to @suites/unit
          // Find or create import from @suites/unit
          const programPath = this.findProgramPath(path);
          if (programPath) {
            this.ensureUnitImport(programPath);
          }
          
          // Remove the sinon import completely - we'll use stubFn from @suites/unit instead
          path.remove();
          modified = true;
        }
      }

      // Case 4: Imports from jest and handle jest.Mocked
      if (source === 'jest') {
        path.node.specifiers.forEach((specifier, index) => {
          if (
            isImportSpecifier(specifier) &&
            isIdentifier(specifier.imported) &&
            specifier.imported.name === 'Mocked'
          ) {
            const newImport = importDeclaration(
              [this.createTypedMockedImportSpecifier()],
              stringLiteral('@suites/unit')
            );

            // Need to find the program path to add the new import
            const programPath = this.findProgramPath(path);
            if (programPath) {
              programPath.node.body.push(newImport);
              // Combine multiple imports from @suites/unit
              this.combineImports(programPath, '@suites/unit');
            }

            path.node.specifiers.splice(index, 1); // Remove the Mocked specifier from the current import
            if (path.node.specifiers.length === 0) {
              path.remove(); // If no other specifiers left, remove the whole import declaration
            }
            modified = true;
          }
        });
      }

      // Add 'type' keyword to any existing Mocked imports from @suites/unit
      if (source === '@suites/unit') {
        path.node.specifiers.forEach((specifier) => {
          if (
            isImportSpecifier(specifier) &&
            isIdentifier(specifier.imported) &&
            specifier.imported.name === 'Mocked' &&
            !specifier.importKind
          ) {
            specifier.importKind = 'type';
            modified = true;
          }
        });

        // Also try to combine multiple imports from @suites/unit
        const programPath = this.findProgramPath(path);
        if (programPath) {
          this.combineImports(programPath, '@suites/unit');
        }
      }
    } else if (path.isTSImportEqualsDeclaration()) {
      const moduleRef = path.node.moduleReference;
      if (
        moduleRef.type === 'TSQualifiedName' &&
        moduleRef.left.type === 'Identifier' &&
        moduleRef.left.name === 'jest' &&
        moduleRef.right.name === 'Mocked'
      ) {
        // Handle jest.Mocked import equals declarations by replacing with a proper import
        const programPath = this.findProgramPath(path);
        if (programPath) {
          // Add a proper import for Mocked from @suites/unit
          const newImport = importDeclaration(
            [this.createTypedMockedImportSpecifier()],
            stringLiteral('@suites/unit')
          );
          programPath.node.body.unshift(newImport);

          // Combine multiple imports from @suites/unit
          this.combineImports(programPath, '@suites/unit');
        }

        // Remove the original import equals declaration
        path.remove();
        modified = true;
      }
    }

    return modified;
  }

  /**
   * Create a typed import specifier for Mocked
   */
  private createTypedMockedImportSpecifier(): ImportSpecifier {
    const specifier = importSpecifier(identifier('Mocked'), identifier('Mocked'));
    specifier.importKind = 'type';
    return specifier;
  }

  /**
   * Find the program path from a child node path
   */
  private findProgramPath(path: NodePath): TypedNodePath<Program> | null {
    let current: NodePath | null = path;
    while (current && !current.isProgram()) {
      current = current.parentPath;
    }
    return current as TypedNodePath<Program>;
  }

  /**
   * Ensure there's an import from @suites/unit
   */
  private ensureUnitImport(programPath: TypedNodePath<Program>): void {
    let hasUnitImport = false;
    
    programPath.node.body.forEach((node) => {
      if (node.type === 'ImportDeclaration' && node.source.value === '@suites/unit') {
        hasUnitImport = true;
      }
    });
    
    if (!hasUnitImport) {
      const newImport = importDeclaration(
        [], // Empty specifiers, will be combined later if needed
        stringLiteral('@suites/unit')
      );
      programPath.node.body.unshift(newImport);
    }
  }

  /**
   * Combine multiple imports from the same source
   */
  private combineImports(programPath: TypedNodePath<Program>, source: string): void {
    // Find all import declarations from the same source
    const importNodes: ImportDeclaration[] = [];
    const importPaths: NodePath[] = [];

    programPath.node.body.forEach((node, index) => {
      if (node.type === 'ImportDeclaration' && node.source.value === source) {
        importNodes.push(node as ImportDeclaration);
        try {
          const importPath = programPath.get(`body.${index}`) as NodePath | null;

          if (importPath) {
            importPaths.push(importPath);
          }
        } catch (e) {}
      }
    });

    // If we have multiple imports, combine them
    if (importNodes.length > 1) {
      // Create a set of import specifiers to deduplicate them
      const combinedSpecifiers: ImportSpecifier[] = [];
      const importedNames = new Set<string>();

      importNodes.forEach((node) => {
        node.specifiers.forEach((specifier) => {
          if (isImportSpecifier(specifier) && isIdentifier(specifier.imported)) {
            const importName = specifier.imported.name;
            // Only add if we haven't seen this import before
            if (!importedNames.has(importName)) {
              importedNames.add(importName);
              combinedSpecifiers.push(specifier as ImportSpecifier);
            }
          }
        });
      });

      // Create a new import declaration with the combined specifiers
      if (combinedSpecifiers.length > 0) {
        const newImport = importDeclaration(combinedSpecifiers, stringLiteral(source));

        // Replace the first import with the combined one
        if (importPaths[0]) {
          importPaths[0].replaceWith(newImport);

          // Remove the other imports
          for (let i = 1; i < importPaths.length; i++) {
            importPaths[i].remove();
          }
        }
      }
    }
  }
}
