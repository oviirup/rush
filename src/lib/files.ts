import node_fs from 'fs/promises';
import path from 'path';

/**
 * Checks if a file or directory exists at a given path.
 *
 * @param path Full path to file or directory .
 * @param type Specify it path should point to a file or directory
 */
async function exists(path: string, type: 'file' | 'dir') {
  try {
    const stat = await node_fs.stat(path);
    return type === 'file' ? stat.isFile() : stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Read and parse JSON file
 *
 * @param path Path to JSON file
 */
async function readJson<T = any>(path: string) {
  const content = await fs.readFile(path, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Generates sequence of directory paths starting from cwd up to root
 *
 * @param cwd Path to starting directory
 */
function* lookup(cwd?: string): Generator<string> {
  cwd ??= process.cwd();
  let dir = path.resolve(cwd);
  const root = path.parse(dir).root;
  while (dir && dir !== root) {
    yield dir;
    dir = path.dirname(dir);
  }
}

const fs = Object.assign(node_fs, { exists, lookup, readJson });

export default fs;
