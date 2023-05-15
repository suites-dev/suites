[![ISC license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
[![ci](https://github.com/omermorad/automock/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/omermorad/automock/actions)

<p align="center">
  <br/>
  <img width="200" src="https://raw.githubusercontent.com/omermorad/automock/master/logo.png" alt="Logo" />

  <h1 align="center">Automock</h1>

  <h3 align="center">
    Standalone Library for Automated Mocking of Class Dependencies
  </h3>

  <h4 align="center">
    Rapid and effortless creation of unit tests
    while ensuring complete isolation of class dependencies.
  </h4>
</p>

## :wave: Hello

The current webpage serves as the installation package for Automock. To use Automock, it is necessary to install the
requisite target libraries of your choice, such as
`@automock/jest` or `@automock/sinon`.

## :question: What is Automock?

**Automock is a TypeScript-based library designed for unit testing applications.**

By leveraging the TypeScript Reflection API (`reflect-metadata`) under the hood, Automock simplifies the process of
writing tests by automatically generating mock objects for a class's dependencies.

You can also browse more information and read
documentation [at the following link](https://github.com/omermorad/automock), in Automock main homepage.

## Installation

Automock simplifies installation by using `npx`. Execute the following command to initiate the process:

```bash
npx automock init
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
