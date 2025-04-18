import runTask, { TaskOptions, TaskOutput } from './run-task';
import pLimit from 'p-limit';

type TaskListOptions = Omit<TaskOptions, 'signal'>;

/**
 * Run tasks in parallel or series
 *
 * @param tasks Array of task names
 * @param opts Task list options
 * @param opts.cwd The current working directory
 * @param opts.io The node.js input/output/error streams
 * @param opts.scripts The npm scripts to run
 * @param opts.arguments The arguments to pass to the npm scripts
 * @param opts.parallel Run the npm scripts in parallel
 * @param opts.labelConfig The label config
 * @param opts.continueOnError Continue running tasks even if one fails
 * @param opts.printLabel Print the label of the tasks
 * @param opts.maxParallel The maximum number of tasks to run in parallel
 * @param opts.silent Suppress all output
 * @param opts.race Abort all tasks if one fails
 * @returns Array of task outputs
 */
async function runTasks(tasks: string[], opts: TaskListOptions) {
  if (tasks.length === 0) return [];

  return opts.parallel
    ? runTasksInParallel(tasks, opts)
    : runTasksInSeries(tasks, opts);
}

async function runTasksInParallel(tasks: string[], opts: TaskListOptions) {
  const ctrl = new AbortController();
  const options = Object.assign({}, opts, { signal: ctrl.signal });

  const taskRunner = (task: string) => {
    try {
      return runTask(task, options);
    } catch (err) {
      if (opts.race) ctrl.abort();
      return Promise.reject(err);
    }
  };

  // Run tasks in parallel with a concurrency limit
  let promises: Promise<TaskOutput>[] = [];
  if (opts.maxParallel > 0) {
    const limit = pLimit(opts.maxParallel);
    promises = tasks.map((task) => limit(() => taskRunner(task)));
  } else {
    promises = tasks.map((task) => taskRunner(task));
  }

  const results = await Promise.allSettled(promises);

  if (opts.race) {
    const hasError = results.some((result) => result.status === 'rejected');
    if (hasError) {
      ctrl.abort();
    }
  }

  return results.map((result) => {
    if (result.status === 'rejected') {
      console.error(result.reason);
      return null;
    }
    return appendErrorCode(result.value);
  });
}

async function runTasksInSeries(tasks: string[], opts: TaskListOptions) {
  const ctrl = new AbortController();
  const options = Object.assign({}, opts, { signal: ctrl.signal });

  const output: (TaskOutput | null)[] = [];
  for (const task of tasks) {
    try {
      const result = await runTask(task, Object.assign({}, options));
      output.push(appendErrorCode(result));
    } catch (error) {
      console.error(error);
      output.push(null);
    }
  }
  return output;
}

function appendErrorCode(output: TaskOutput) {
  // prettier-ignore
  const signalMap: Partial<Record<NodeJS.Signals, number>> = {
    SIGABRT:  6, SIGALRM: 14, SIGBUS:  10, SIGCHLD: 20, SIGCONT: 19,
    SIGFPE:   8, SIGHUP:   1, SIGILL:   4, SIGINT:   2, SIGKILL:  9,
    SIGPIPE: 13, SIGQUIT:  3, SIGSEGV: 11, SIGSTOP: 17, SIGTERM: 15,
    SIGTRAP:  5, SIGTSTP: 18, SIGTTIN: 21, SIGTTOU: 22, SIGUSR1: 30,
    SIGUSR2: 31,
  };

  if (output.code === null && output.signal !== null) {
    // An exit caused by a signal must return a status code
    // of 128 plus the value of the signal code.
    // Ref: https://nodejs.org/api/process.html#process_exit_codes
    const signalCode = signalMap[output.signal];
    if (signalCode) {
      output.code = 128 + signalCode;
    }
  }
  return output;
}

export default runTasks;
