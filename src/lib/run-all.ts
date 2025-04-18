import path from 'path';
import { RushOptions } from '../types';
import parsePatterns from './parse-patterns';
import parseTasks from './parse-tasks';
import readPackageJson from './read-package-json';
import runTasks from './run-tasks';

/**
 * Primitive implementation of `rush`
 *
 * Run multiple npm scripts parallelly or sequentially
 *
 * @param inputPatterns Array of npm script names / patterns to run
 * @param opts Configuration options for running scripts
 * @param opts.cwd The current working directory
 * @param opts.io The node.js input/output/error streams
 * @param opts.scripts The npm scripts to run
 * @param opts.arguments The arguments to pass to the npm scripts
 * @param opts.parallel Run the npm scripts in parallel
 * @param opts.continueOnError Continue running tasks even if one fails
 * @param opts.printLabel Print the label of the tasks
 * @param opts.maxParallel The maximum number of tasks to run in parallel
 * @param opts.silent Suppress all output
 * @param opts.race Abort all tasks if one fails
 * @returns The result of the tasks
 */
async function runAll(inputPatterns: string[], opts: RushOptions) {
  const cwd = opts.cwd ?? process.cwd();
  const stdin = opts.io?.stdin ?? process.stdin;
  const stdout = opts.io?.stdout ?? process.stdout;
  const stderr = opts.io?.stderr ?? process.stderr;
  const args = opts.arguments ?? [];
  const scripts = opts.scripts || [];
  const continueOnError = Boolean(opts.continueOnError);
  const printLabel = Boolean(opts.printLabel);
  const parallel = Boolean(opts.parallel);
  const race = Boolean(opts.race);
  const maxParallel = opts.maxParallel ?? 0;
  const silent = Boolean(opts.silent);

  try {
    const patterns = parsePatterns(inputPatterns, args);
    if (patterns.length === 0) {
      return Promise.resolve([]);
    }
    if (typeof maxParallel !== 'number' || maxParallel < 0) {
      throw new Error('Invalid options.maxParallel');
    }
    if (!parallel && race) {
      throw new Error('Invalid options.race; It requires options.parallel');
    }

    // get npm execution path
    const npmPath = opts.npmPath || process.env.npm_execpath;
    const npmPathIsJs = npmPath && /\.m?js/.test(path.extname(npmPath));
    const execPath = npmPathIsJs ? process.execPath : npmPath || 'npm';

    return Promise.resolve()
      .then(() => scripts || readPackageJson(cwd))
      .then((scripts) => {
        const tasks = parseTasks(scripts, patterns);

        // get max width of task labels
        const labelWidth = tasks.reduce((max, task) => {
          return Math.max(max, task.length);
        }, 0);
        const labelConfig = {
          width: labelWidth,
          enabled: printLabel,
          lastPrefix: null,
        };

        return runTasks(tasks, {
          cwd,
          io: { stdin, stdout, stderr },
          scripts,
          arguments: args,
          continueOnError,
          printLabel,
          labelConfig,
          parallel,
          race,
          maxParallel,
          silent,
          npmPath: execPath,
        });
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        return Promise.reject(message);
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Promise.reject(message);
  }
}

export default runAll;
