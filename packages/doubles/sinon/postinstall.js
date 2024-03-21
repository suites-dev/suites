const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'unit.core', 'typings.d.ts');
const newContent = "export { TestBed } from './dist';\nexport * from '@suites/doubles.sinon';\n";

fs.readFile(filePath, 'utf8', function (err, data) {
  console.log('Suites: attempting to override @suites/unit typings file');

  if (err) {
    console.log('Suites: an error occurred while reading @suites/unit typings file');
    return console.error(err);
  }

  const updatedData = data + newContent;

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
