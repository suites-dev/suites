#!/usr/bin/env node

import { prompt } from 'inquirer';
import { detect as detectPackageManager, PM } from 'detect-package-manager';
import { exec } from 'child_process';

console.info('Please make sure your working tree is clear');

const commands: Record<PM, string> = {
  npm: 'npm install -D',
  yarn: 'yarn add -D --silent --ignore-workspace-root-check',
  pnpm: 'pnpm add -D --silent',
};

async function start() {
  prompt([
    {
      type: 'list',
      name: 'doubles',
      message: 'Please select the test doubles library that you are currently using',
      choices: [
        {
          value: 'jest',
          name: 'Jest',
        },
        {
          value: 'sinon',
          name: 'Sinon',
        },
      ],
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Please select the DI framework that you are currently using',
      choices: [
        {
          value: 'nestjs',
          name: 'NestJs',
        },
      ],
    },
  ]).then(({ doubles, framework }) => {
    prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Automock is about to install "@automock/jest" and "@automock/nestjs", confirm?`,
      },
    ]).then(async ({ confirm }) => {
      if (!confirm) {
        console.info('Canceling');
        process.exit(1);
      }

      const packageManager = await detectPackageManager();
      const command = commands[packageManager];

      if (!command) {
        console.info(
          'Automock cannot detect your package manager. \n' +
            'In order to proceed, perform a manual installation of the necessary packages: \n' +
            `"@automock/${doubles}" and "@automock/${framework}"`
        );

        process.exit(0);
      } else {
        exec(`${command} @automock/${doubles} @automock/${framework}`, (error, stderr, stdout) => {
          if (error) {
            throw error;
          }

          if (stderr) {
            console.error(stderr);
          }

          console.log(stdout);
        });
      }
    });
  });
}

start();
