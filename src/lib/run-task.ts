import { IOType } from 'node:child_process';
import Stream from 'stream';
import { RushOptions } from '../types';
import { LabelConfig, PrefixTransform } from './prefix-transform';
import spawn from './spawn';
import pi from 'picocolors';
import { parse as parseArgs, ParseEntry } from 'shell-quote';

export type TaskOptions = Required<RushOptions> & {
  labelConfig: LabelConfig;
  signal?: AbortSignal | null;
};

export type TaskOutput = {
  task: string;
  code: number;
  signal: NodeJS.Signals | null;
};

function runTask(task: string, opts: TaskOptions): Promise<TaskOutput> {
  const stdin = opts.io.stdin;
  const stdout = wrapLabeling(task, opts.io.stdout, opts.labelConfig);
  const stderr = wrapLabeling(task, opts.io.stderr, opts.labelConfig);

  const stdinKind = detectStreamKind(stdin, process.stdin);
  const stdoutKind = detectStreamKind(stdout, process.stdout);
  const stderrKind = detectStreamKind(stderr, process.stderr);

  const spawnOptions = { stdio: [stdinKind, stdoutKind, stderrKind] };
  const spawnArgs = ['run', ...parseArgs(task).map(cleanTaskArg)];

  if (opts.silent) {
    spawnArgs.push('--silent');
  }

  return new Promise((resolve, reject) => {
    const execPath = opts.npmPath ?? 'npm';
    const childProcess = spawn(execPath, spawnArgs, spawnOptions);

    // use abort signal to abort the child process
    opts.signal?.addEventListener('abort', () => {
      childProcess.kill('SIGTERM');
    });

    // Piping stdio.
    if (stdinKind === 'pipe' && childProcess.stdin) {
      stdin.pipe(childProcess.stdin);
    }
    if (stdoutKind === 'pipe') {
      childProcess.stdout?.pipe(stdout, { end: false });
    }
    if (stderrKind === 'pipe') {
      childProcess.stderr?.pipe(stderr, { end: false });
    }

    // Register
    childProcess.on('error', (err: Error) => {
      reject(err);
    });
    childProcess.on('close', (code: number, signal: NodeJS.Signals) => {
      resolve({ task, code, signal });
    });
  });
}

const colors = [pi.cyan, pi.green, pi.magenta, pi.yellow, pi.red];
let colorIndex = 0;
const taskColorMap = new Map();

/** Select a color from given task name. */
function selectColor(taskName: string) {
  let color = taskColorMap.get(taskName);
  if (!color) {
    color = colors[colorIndex];
    colorIndex = (colorIndex + 1) % colors.length;
    taskColorMap.set(taskName, color);
  }
  return color;
}

/** Wrap the source stream with a labeling stream. */
function wrapLabeling(taskName: string, source: any, cfg: LabelConfig) {
  if (!source || !cfg.enabled) return source;
  const color = source.isTTY ? selectColor(taskName) : (x: string) => x;
  const label = taskName.trim().padEnd(cfg.width);
  const prefix = `${color(label)}${pi.gray('|')} `;

  const stream = new PrefixTransform(prefix, cfg);
  stream.pipe(source);
  return stream;
}

/** Detect the kind of stream. */
function detectStreamKind(
  stream: Stream,
  std:
    | (NodeJS.ReadStream & { fd: 0 })
    | (NodeJS.WriteStream & { fd: 1 })
    | (NodeJS.WriteStream & { fd: 2 }),
): IOType | Stream {
  return !stream ? 'ignore' : stream !== std || !std.isTTY ? 'pipe' : stream;
}

/** Clean the task argument. */
function cleanTaskArg(arg: ParseEntry): string {
  if (typeof arg === 'string') return arg;
  if ('op' in arg) return arg.op;
  if ('pattern' in arg) return arg.pattern as string;
  return '';
}

export default runTask;
