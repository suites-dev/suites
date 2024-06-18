import type { NodePath } from '@babel/traverse';
import type { Identifier, ImportDeclaration, ImportSpecifier, Program } from '@babel/types';
import { importDeclaration, isImportSpecifier, stringLiteral } from '@babel/types';

export class ImportManager {
  public manageImports(path: NodePath<ImportDeclaration>, modified: boolean): boolean {
    if (
      path.node.source.value === '@automock/jest' ||
      path.node.source.value === '@automock/sinon'
    ) {
      path.node.source.value = '@suites/unit';
      modified = true;
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

    // Combine imports if necessary
    this.combineImports(path.parentPath as NodePath<Program>, '@suites/unit');
    return modified;
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
