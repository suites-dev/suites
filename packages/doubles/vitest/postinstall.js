import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePaths = [
  path.join(__dirname, '..', 'unit', 'dist', 'esm', 'index.d.ts'),
  path.join(__dirname, '..', 'unit', 'dist', 'cjs', 'index.d.ts'),
];

const newContent = '/// <reference types="@suites/doubles.vitest/unit" />\n';

filePaths.forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log('Suites: @suites/unit typings file does not exist');
    return;
  }

  fs.readFile(filePath, 'utf8', function (err, data) {
    console.log('Suites: attempting to override @suites/unit reference types');

    if (err) {
      console.log('Suites: an error occurred while reading @suites/unit');
      return console.error(err);
    }

    const updatedData = newContent + data;

    fs.writeFile(filePath, updatedData, 'utf8', function (err) {
      if (err) {
        console.log('Suites: an error occurred while writing to @suites/unit typings file');
        return console.log(err);
      }

      console.log(
        'Suites: @suites/unit typings file updated successfully with the proper doubles adapter (@suites/doubles.vitest)'
      );
    });
  });
});
