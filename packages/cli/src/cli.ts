#!/usr/bin/env node
import inquirer from 'inquirer';
import shelljs from 'shelljs';

inquirer
  .prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager are you using?',
      choices: ['yarn', 'npm'],
    },
    {
      type: 'list',
      name: 'mockLibrary',
      message: 'Which mocking library are you using?',
      choices: ['Jest', 'Sinon'],
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Which framework are you using?',
      choices: ['NestJS', 'Angular', 'Ts.ED'],
    },
  ])
  .then((answers: any) => {
    let packagesToInstall: string;
    let installCommand: string;
    let framework: string;

    if (answers.packageManager === 'npm') {
      installCommand = 'npm install -D';
    } else {
      installCommand = 'yarn add -D -W';
    }

    if (answers.mockLibrary === 'Jest') {
      packagesToInstall = '@automock/jest @types/jest jest';
    } else {
      packagesToInstall = '@automock/sinon @types/sinon sinon';
    }

    if (answers.mockLibrary === 'NestJS') {
      framework = '@automock/nestjs';
    } else {
      console.log('Unfortunately it is not available yet, but we are working on this!');
    }

    shelljs.exec(`${installCommand} ${packagesToInstall}`);

    answers.mockLibrary;
    answers.framework;
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
