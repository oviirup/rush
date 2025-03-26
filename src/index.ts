import { NodeStdio, RushOptions } from '~/types';
import pi from 'picocolors';

export async function rush(tasks: string[], opts: RushOptions = {}) {
  const stdio: Partial<NodeStdio> = {
    stdin: opts.stdio?.stdin ?? process.stdin,
    stdout: opts.stdio?.stdout ?? process.stdout,
    stderr: opts.stdio?.stderr ?? process.stderr,
  };

  // make sure --max flag is a number
  opts.max = parseInt(String(opts.max), 10);
  if (Number.isNaN(opts.max) || opts.max < 0) {
    throw new Error(pi.red('Invalid options.max, must be a number'));
  }
  if (tasks.length === 0) {
    throw new Error(pi.red('No tasks are provided'));
  }
  if (!opts.parallel && opts.race) {
    throw new Error(pi.red('options.race require options.parallel'));
  }

  // TODO: parse tasks

  // TODO: run tasks
}

export default rush;
