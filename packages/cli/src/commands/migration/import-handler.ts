import type { NodePath } from '@babel/traverse';
import type {
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  Program,
  TSImportEqualsDeclaration,
} from '@babel/types';
import {
  importDeclaration,
  isImportSpecifier,
  stringLiteral,
  importSpecifier,
  tsImportEqualsDeclaration,
  identifier as babelIdentifier,
  tsQualifiedName,
} from '@babel/types';

export class ImportManager {
  public manageImports(
    path: NodePath<ImportDeclaration | TSImportEqualsDeclaration>,
    modified: boolean
  ): boolean {
    if (path.isImportDeclaration()) {
      if (
        path.node.source.value === '@automock/jest' ||
        path.node.source.value === '@automock/sinon'
      ) {
        path.node.source.value = '@suites/unit';
        modified = true;
      }

      if (path.node.source.value === 'sinon') {
        let sinonStubbedInstanceIndex = -1;
        path.node.specifiers.forEach((specifier, index) => {
          if (
            isImportSpecifier(specifier) &&
            (specifier.imported as Identifier).name === 'SinonStubbedInstance'
          ) {
            sinonStubbedInstanceIndex = index;
          }
        });

        if (sinonStubbedInstanceIndex !== -1) {
          path.node.specifiers.splice(sinonStubbedInstanceIndex, 1);
          modified = true;

          // Add Mocked from @suites/unit if not already imported
          const alreadyImported = this.alreadyImportedMocked(path);
          if (!alreadyImported) {
            const newImport = importDeclaration(
              [this.createTypedMockedImportSpecifier()],
              stringLiteral('@suites/unit')
            );
            path.insertAfter(newImport);
          }
        }
      }

      if (path.node.source.value === '@automock/core') {
        path.node.specifiers.forEach((specifier) => {
          if (
            isImportSpecifier(specifier) &&
            (specifier.imported as Identifier).name === 'UnitReference'
          ) {
            (specifier.imported as Identifier).name = 'UnitReference';
            path.node.source.value = '@suites/unit';
            modified = true;
          }
        });
      }

      if (path.node.source.value === 'jest') {
        path.node.specifiers.forEach((specifier, index) => {
          if (
            isImportSpecifier(specifier) &&
            (specifier.imported as Identifier).name === 'Mocked'
          ) {
            const newImport = importDeclaration(
              [this.createTypedMockedImportSpecifier()],
              stringLiteral('@suites/unit')
            );
            path.parentPath.node.body.push(newImport); // Add new import to the program body
            path.node.specifiers.splice(index, 1); // Remove the Mocked specifier from the current import
            if (path.node.specifiers.length === 0) {
              path.remove(); // If no other specifiers left, remove the whole import declaration
            }
            modified = true;
          }
        });
      }
      
      // Add 'type' keyword to any existing Mocked imports from @suites/unit
      if (path.node.source.value === '@suites/unit') {
        path.node.specifiers.forEach((specifier) => {
          if (
            isImportSpecifier(specifier) &&
            (specifier.imported as Identifier).name === 'Mocked' &&
            !specifier.importKind
          ) {
            specifier.importKind = 'type';
            modified = true;
          }
        });
      }
    } else if (path.isTSImportEqualsDeclaration()) {
      // Specific handling for TypeScript style imports
      const tsImport = path.node;
      if (
        tsImport.moduleReference.type === 'TSQualifiedName' &&
        tsImport.moduleReference.left.name === 'jest' &&
        tsImport.moduleReference.right.name === 'Mocked'
      ) {
        // Create a new TypeScript import equals declaration replacing jest.Mocked with Suites Mocked
        const newTSImport = tsImportEqualsDeclaration(
          babelIdentifier(tsImport.name.name),
          tsQualifiedName(babelIdentifier('@suites/unit'), babelIdentifier('Mocked'))
        );
        path.replaceWith(newTSImport);
        modified = true;
      }
    }

    // Combine imports if necessary
    if (path.parentPath.isProgram()) {
      this.combineImports(path.parentPath, '@suites/unit');
    }

    return modified;
  }

  /**
   * Create an import specifier for Mocked with the 'type' keyword
   */
  private createTypedMockedImportSpecifier(): ImportSpecifier {
    const mockedSpecifier = importSpecifier(
      babelIdentifier('Mocked'),
      babelIdentifier('Mocked')
    );
    mockedSpecifier.importKind = 'type';
    return mockedSpecifier;
  }

  private alreadyImportedMocked(path: NodePath<Program>): boolean {
    // Look through the entire program to see if there's already an import for Mocked from @suites/unit
    return path.parent.body.some(
      (node: any) =>
        node.type === 'ImportDeclaration' &&
        node.source.value === '@suites/unit' &&
        node.specifiers.some(
          (specifier: any) =>
            specifier.type === 'ImportSpecifier' &&
            (specifier.imported.name === 'Mocked' || specifier.local.name === 'Mocked')
        )
    );
  }

  private combineImports(programPath: NodePath<Program>, source: string): void {
    const importDeclarations = programPath
      .get('body')
      .filter((p: NodePath) => p.isImportDeclaration() && p.node.source.value === source);

    if (importDeclarations.length > 1) {
      const combinedSpecifiers = importDeclarations.reduce((acc, declarationPath) => {
        acc.push(...declarationPath.node.specifiers);
        return acc;
      }, [] as ImportSpecifier[]);

      // Create a new import declaration with combined specifiers
      const newImportDeclaration = importDeclaration(combinedSpecifiers, stringLiteral(source));

      // Replace the first import declaration with the new one
      importDeclarations[0].replaceWith(newImportDeclaration);

      // Remove the remaining import declarations
      importDeclarations.slice(1).forEach((declarationPath) => declarationPath.remove());
    }
  }
}
