import pkg from '../../package.json';
import pi from 'picocolors';

/** Print a help text */
export function printHelpText() {
  process.stdout.write(`
${pi.cyan(pkg.displayName)}
${pkg.description}

Usage: rush ${pi.dim('[OPTIONS] <tasks>')}

  ${pi.dim('tasks - list of npm-scripts names and glob patterns')}

Options:
  -s --serial    ${pi.dim('Run scripts in sequential order')}
  -c --continue  ${pi.dim(`Set the flag to continue executing other tasks even if a task threw an error`)}
  -m --max       ${pi.dim('Set the maximum number of parallelism. Default is 0 i.e. unlimited')}
  -r --race      ${pi.dim('Set the flag to kill all tasks when a task finished with zero')}
     --silent    ${pi.dim('Set the log level of npm to silent')}

  Shorthand can also be combined together
  For example, '-csr' means '-c -s -r'

Examples:
  ${pi.dim('$')} rush watch:**
  ${pi.dim('$')} rush "build:** -- --watch"
  ${pi.dim('$')} rush -sr "build:**"
  ${pi.dim('$')} rush start-server start-browser start-electron

`);
  return Promise.resolve(null);
}
