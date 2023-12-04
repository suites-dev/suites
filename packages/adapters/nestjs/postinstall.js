const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'common', 'typings.d.ts');
const newContent = "\nexport type IdentifierMetadata = import('@automock/adapters.nestjs').IdentifierMetadata;\n";

fs.readFile(filePath, 'utf8', function (err, data) {
  console.log('Automock: attempting to override @automock/common typings file')

  if (err) {
    console.log('Automock: an error occurred while reading @automock/common typings file')
    return console.error(err);
  }

  const updatedData = data + newContent;

  fs.writeFile(filePath, updatedData, 'utf8', function (err) {
    if (err) {
      console.log('Automock: an error occurred while writing to @automock/common typings file')
      return console.log(err);
    }

    console.log('Automock: @automock/common typings file updated with successfully with the proper Automock adapter')
  });
});
