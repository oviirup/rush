import parseArgv from './lib/parse-argv';
import readPackageJson from './lib/read-package-json';
import runAll from './lib/run-all';
import { RushOptions } from './types';

async function rush(inputArgs: string[], opts: Partial<RushOptions> = {}) {
  const args = parseArgv(inputArgs);
  // should not run race without parallel
  if (!args.parallel && args.race) {
    throw new Error('Invalid Option: --race require --parallel');
  } else if (!args.parallel && args.maxParallel) {
    throw new Error('Invalid Option: --max require --parallel');
  }

  try {
    const cwd = opts.cwd ?? process.cwd();
    const scripts = await readPackageJson(cwd);

    if (scripts.length === 0) {
      throw new Error('No tasks found in package.json');
    }

    const io = {
      stdin: opts.io?.stdin ?? process.stdin,
      stdout: opts.io?.stdout ?? process.stdout,
      stderr: opts.io?.stderr ?? process.stderr,
    };

    const config: Required<RushOptions> = {
      cwd,
      io,
      scripts,
      arguments: opts.arguments ?? args.arguments,
      continueOnError: Boolean(opts.continueOnError ?? args.continueOnError),
      printLabel: Boolean(opts.printLabel ?? args.printLabel),
      parallel: Boolean(opts.parallel ?? args.parallel),
      race: Boolean(opts.race ?? args.race),
      maxParallel: opts.maxParallel ?? args.maxParallel,
      silent: Boolean(opts.silent ?? args.silent),
    };

    // run all groups with promises
    const promise = args.groups.reduce(async (acc, group) => {
      if (group.patterns.length === 0) return acc;
      return acc.then(() => {
        return runAll(group.patterns, {
          ...config,
          parallel: group.parallel,
          maxParallel: group.parallel ? args.maxParallel : 1,
        });
      });
    }, Promise.resolve() as Promise<any>);

    if (!args.silent) {
      promise.catch((err) => {
        throw new Error(err);
      });
    }

    return promise;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Promise.reject(message);
  }
}

export { rush };
export default rush;
