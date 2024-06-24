const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, '..', 'unit', 'dist', 'esm', 'index.d.ts'),
  path.join(__dirname, '..', 'unit', 'dist', 'cjs', 'index.d.ts'),
];

const newContent = '/// <reference types="@suites/doubles.sinon/unit" />\n';

filePaths.forEach((filePath) => {
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
        'Suites: @suites/unit typings file updated successfully with the proper doubles adapter (@suites/doubles.sinon)'
      );
    });
  });
});
