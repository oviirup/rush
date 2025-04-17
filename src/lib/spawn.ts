import os from 'os';
import crossSpawn from 'cross-spawn';
import type child_process from 'child_process';

/**
 * Launches a new process with the given command.
 *
 * It is a wrapper around "cross-spawn" module that provides proper cleanup of
 * child processes for both POSIX and Windows systems.
 *
 * @param command The command to run.
 * @param args List of string arguments.
 * @param options Options.
 * @returns A ChildProcess instance of new process.
 */
export function spawn(
  command: string,
  args: string[],
  opts: child_process.SpawnOptions,
) {
  const ch = crossSpawn(command, args, opts);
  const pid = ch.pid;

  if (pid) {
    const handleProcessExit = async (exit: boolean = false) => {
      await terminateProcessTree(pid);
      process.stdout.write('\x1b[?25h'); // ANSI escape code to show the cursor
      if (exit) process.exit();
    };
    ch.on('exit', () => handleProcessExit());
    process.on('exit', () => handleProcessExit());
    process.on('SIGTERM', () => handleProcessExit(true));
    process.on('SIGINT', () => handleProcessExit(true));
  }

  return ch;
}

/**
 * Kills a process and all of its subprocesses.
 *
 * @param pid The process ID to kill.
 */
export async function terminateProcessTree(pid?: number) {
  if (!pid) return;
  if (process.platform === 'win32') {
    // windows automatically kills any sub processes
    crossSpawn('taskkill', ['/F', '/T', '/PID', String(pid)]);
  } else {
    // in posix systems list out all sub processes and kill individually
    const list = await getProcessTree(pid);
    if (!list?.length) return;
    try {
      for (const pid of list) process.kill(pid);
    } catch {
      // ignore for now
    }
  }
}

type ProcessTree = number[] | null;

/**
 * Recursively gets all child process IDs for a given parent PID (POSIX only).
 *
 * It is a simplified form of the original package
 * [pidtree](https://www.npmjs.com/package/pidtree)
 *
 * @private
 * @param pid The parent process ID.
 * @returns A promise resolving to an array of child PIDs or null
 */
async function getProcessTree(pid: number) {
  return new Promise<ProcessTree>((resolve, reject) => {
    const ch = crossSpawn('ps', ['-A', '-o', 'ppid,pid']);
    let finished = false;
    let stdout = '';
    // write stdout stream to single string text
    ch.stdout?.on('data', (d) => {
      stdout += d.toString();
    });
    // reject promise on error
    ch.on('error', (err) => {
      if (finished) return;
      finished = true;
      reject(err);
    });
    // get processes list on completion
    ch.on('close', (code) => {
      if (finished) return;
      finished = true;
      // reject promise for all non-zero exit codes
      if (code !== 0) {
        reject(new Error(`ps command exited with code ${code}`));
        return;
      }
      // loop through each lines of stdout
      const list: number[] = [];
      for (let line of stdout.split(os.EOL)) {
        line = line.trim();
        if (!line) continue;
        const parts = line.split(/\s+/);
        if (parts.length === 2) {
          const ppid = parseInt(parts[0], 10);
          const childPid = parseInt(parts[1], 10);
          if (!Number.isNaN(ppid) && !Number.isNaN(childPid) && ppid === pid) {
            list.push(childPid);
          }
        }
      }
      resolve(list);
    });
  });
}

export default spawn;
