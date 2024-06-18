import type * as fs from 'fs';
import * as path from 'path';
import type { CodeTransformer } from './code-transformer';

export class MigrationHandler {
  private modifiedFiles: number = 0;

  constructor(
    private readonly fileSystem: typeof fs,
    private readonly transformer: CodeTransformer
  ) {}

  public migrate(folderPath: string): void {
    this.traverseDirectory(folderPath);

    this.fileSystem.appendFileSync(
      'migration.log',
      `Summary: ${this.modifiedFiles} files were modified.\n`
    );

    console.log(
      `Migration complete. ${this.modifiedFiles} files were modified. See migration.log for details.`
    );
  }

  private updateFile(filePath: string): void {
    const code = this.fileSystem.readFileSync(filePath, 'utf8');
    const result = this.transformer.transformCode(code);

    if (result.modified) {
      this.fileSystem.writeFileSync(filePath, result.code);
      this.fileSystem.appendFileSync('migration.log', `Modified: ${filePath}\n`);

      this.modifiedFiles++;
    }
  }

  private traverseDirectory(dir: string): void {
    this.fileSystem.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);

      if (this.fileSystem.statSync(fullPath).isDirectory()) {
        this.traverseDirectory(fullPath);
      } else if (path.extname(fullPath) === '.ts') {
        this.updateFile(fullPath);
      }
    });
  }
}
