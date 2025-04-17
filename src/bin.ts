#!/usr/bin/env node
import pkg from '../package.json';
import rush from './index';
import pi from 'picocolors';

void (function main() {
  const argv = process.argv.slice(2);

  switch (argv[0]) {
    case undefined:
    case '-h':
    case '--help':
      printHelpText();
      break;
    case '-v':
    case '--version':
      printVersionText();
      break;
    default:
      // Avoid max listeners exceeded warnings.
      process.stdout.setMaxListeners(0);
      process.stderr.setMaxListeners(0);
      process.stdin.setMaxListeners(0);

      rush(argv)
        .then(() => {
          process.exit(0);
        })
        .catch((err) => {
          process.stderr.write(pi.red(`ERROR: ${err}`));
          process.exit(1);
        });
  }
})();

/** Print a help text */
function printHelpText() {
  process.stdout.write(`
${pi.cyan(pkg.displayName)}
${pkg.description}

Usage: rush ${pi.gray('[OPTIONS] <tasks>')}

  ${pi.gray('tasks - list of npm-scripts names and glob patterns')}

Options:
  -p --parallel   ${pi.gray('Run a group of tasks in parallel order')}
  -s --sequential ${pi.gray('Run a group of tasks in sequential order')}
  -c --continue   ${pi.gray(`Set the flag to continue executing other tasks even if a task threw an error`)}
  -m --max        ${pi.gray('Set the maximum number of parallelism. Default is 0 i.e. unlimited')}
  -l --label      ${pi.gray('Print the label of the task as prefix on each line of output')}
  -r --race       ${pi.gray('Set the flag to kill all tasks when a task finished with zero')}
     --silent     ${pi.gray('Set the log level of npm to silent')}

  Shorthand can also be combined together
  For example, '-csr' means '-c -s -r'

Examples:
  ${pi.gray('$')} rush watch:**
  ${pi.gray('$')} rush "build:** -- --watch"
  ${pi.gray('$')} rush -sr "build:**"
  ${pi.gray('$')} rush start-server start-browser start-electron
`);
}

/** Print a cli version */
function printVersionText() {
  process.stdout.write(`v${pkg.version}\n`);
}
