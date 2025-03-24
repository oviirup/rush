# Rush ![](https://img.shields.io/badge/WIP-gold)

Simple and light-weight CLI tool to run scripts together in parallelly or sequentially.

The builtin `run` command for most of the package managers like `npm run ...`, `bun run ...` cannot run multiple scripts by design, let alone running it in parallel. You need to create a chain of scripts to run it sequentially, which may not look pretty and redundant.

This tool helps to clearup the multi script running using _glob patterns_, and also helps to resolve in cross platform script chaining issue.

## Getting started

### Installation

Install it with whatever package manager you like `npm`, `yarn`, or `bun`.

```bash
npm i @oviirup/rush -D
```

It will install the package with binary `rush` and you are all ready to run.

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
