# Rush ![](https://img.shields.io/badge/WIP-gold)

![publish](https://github.com/oviirup/rush/workflows/CI/badge.svg)
[![version](https://img.shields.io/npm/v/@oviirup/rush)](https://www.npmjs.com/package/@oviirup/rush)

Simple and lightweight CLI tool to run scripts together in parallel or sequentially.

The built-in `run` command for most of the package managers like `npm run ...`, and `bun run ...` cannot run multiple scripts by design, let alone run it in parallel. You need to create a chain of scripts to run it sequentially, which may not look pretty and redundant.

This tool helps to clear up the multi-script running using _glob patterns_, and also helps to resolve cross-platform script chaining issues.

## Getting started

### Installation

Install it with whatever package manager you like `npm`, `yarn`, or `bun`.

```bash
npm i @oviirup/rush -D
```

It will install the package with binary `rush` and you are all ready to run.

### Usage

`@oviirup/rush` comes with zero-config binary `rush` with the following options...

- `-s` `--serial` : Boolean  
  Run scripts in sequential order
- `-c` `--continue` : Boolean  
  Set the flag to continue executing other tasks even if a task throws an error
- `-m` `--max` : Number  
  Set the maximum number of parallelism. Default is 0 i.e. unlimited
- `-r` `--race` : Boolean  
  Set the flag to kill all tasks when a task finished with zero
- `--silent` : Boolean  
  Set the log level of npm to silent

You can also use the shorthand flags together like `-scr` that translates to `-s -c -r`

### Examples

```bash
$ rush watch:**
$ rush "build:** -- --watch"
$ rush -sr "build:**"
$ rush start-server start-browser start-electron
```

> Note: In some cases, like while using glob patterns you may need to wrap the commands with quotes for them to work properly

## Contributing & Development

You are welcome to contribute to the project. Please follow the [contributing guidelines](/.github/contributing.md) before making any contribution.

- **Fork & clone to local machine**  
  Fork the repo from GitHub by clicking the fork button at the top-right and clone it...

```bash
  git clone https://github.com/oviirup/rush.git
```

- **Create a new branch**  
  Please make sure you are not on the **main** branch before making any changes.

```bash
  git checkout -b my-new-branch
```

- **Install dependencies**  
  This project uses [pnpm](https://pnpm.io/), although any other package manager can be used as well.

```bash
  pnpm install
```
