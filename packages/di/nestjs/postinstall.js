const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'types.di', 'typings.d.ts');
const newContent =
  "\nexport type IdentifierMetadata = import('@suites/di.nestjs').IdentifierMetadata;\n";

fs.readFile(filePath, 'utf8', function (err, data) {
  console.log('Suites: attempting to override @suites/common typings file');

  if (err) {
    console.log('Suites: an error occurred while reading @suites/common typings file');
    return console.error(err);
  }

  const updatedData = data + newContent;

  fs.writeFile(filePath, updatedData, 'utf8', function (err) {
    if (err) {
      console.log('Suites: an error occurred while writing to @suites/common typings file');
      return console.log(err);
    }

    console.log(
      'Suites: @suites/common typings file updated with successfully with a proper di adapter'
    );
  });
});
