import type * as fs from 'fs';
import * as path from 'path';
import type { CodeTransformer } from './code-transformer';

export class MigrationHandler {
  private modifiedFiles: number = 0;

  constructor(
    private readonly fileSystem: typeof fs,
    private readonly transformer: CodeTransformer
  ) {}

  public async migrate(folderPath: string): Promise<void> {
    await this.traverseDirectory(folderPath);

    this.fileSystem.appendFileSync(
      'migration.log',
      `Summary: ${this.modifiedFiles} files were modified.\n`
    );

    console.log(
      `Migration complete. ${this.modifiedFiles} files were modified. See migration.log for details.`
    );
  }

  private async updateFile(filePath: string): Promise<void> {
    const code = this.fileSystem.readFileSync(filePath, 'utf8');
    const result = await this.transformer.transformCode(code);

    if (result.modified) {
      this.fileSystem.writeFileSync(filePath, result.code);
      this.fileSystem.appendFileSync('migration.log', `Modified: ${filePath}\n`);

      this.modifiedFiles++;
    }
  }

  private async traverseDirectory(dir: string): Promise<void> {
    const files = this.fileSystem.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);

      if (this.fileSystem.statSync(fullPath).isDirectory()) {
        await this.traverseDirectory(fullPath);
      } else if (path.extname(fullPath) === '.ts') {
        await this.updateFile(fullPath);
      }
    }
  }
}
