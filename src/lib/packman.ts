import path from 'path';
import fs from '~/helpers/files';

export const AGENTS = ['npm', 'yarn', 'pnpm', 'bun', 'deno'] as const;
export type Agent = (typeof AGENTS)[number];

export const LOCKS: Record<string, Agent> = {
  'bun.lock': 'bun',
  'bun.lockb': 'bun',
  'deno.lock': 'deno',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
  'npm-shrinkwrap.json': 'npm',
};

/**
 * Detects the current package managers from lock-files
 *
 * It is a stripped-down and modified version of
 * [package-manager-detector](https://github.com/antfu-collective/package-manager-detector)
 * created by Antony Fu
 *
 * @param cwd - Path to working directory
 */
export async function detect(cwd?: string) {
  // look for package manager using following strategies in order
  const strategies = ['lockfile', 'package-json-field', 'user-agent'];

  for (const dir of lookup(cwd)) {
    for (const strategy of strategies) {
      switch (strategy) {
        case 'lockfile': {
          const result = await fromLockFiles(dir);
          if (result) return result;
          break;
        }
        case 'package-json-field': {
          const result = await fromPackageJson(dir);
          if (result) return result;
          break;
        }
        case 'user-agent': {
          const result = fromUserAgent();
          if (result) return result;
          break;
        }
      }
    }
  }
  return null;
}

function* lookup(cwd?: string): Generator<string> {
  cwd ??= process.cwd();
  let dir = path.resolve(cwd);
  const root = path.parse(dir).root;
  while (dir && dir !== root) {
    yield dir;
    dir = path.dirname(dir);
  }
}

/**
 * Get package manager from lock files present in directory
 *
 * @param cwd - Working directory to look for lock files
 */
export async function fromLockFiles(cwd: string) {
  // Look up for lock files
  for (const lock of Object.keys(LOCKS)) {
    const lockFilePath = path.join(cwd, lock);
    const exists = await fs.exists(lockFilePath, 'file');
    if (exists) {
      const name = LOCKS[lock];
      const result = await fromPackageJson(cwd);
      if (result) return result;
      else return name;
    }
  }
  return null;
}

/**
 * Get package manager the package.json
 *
 * @param cwd - Working directory to look for package.json
 */
export async function fromPackageJson(cwd: string) {
  try {
    const filePath = path.join(cwd, 'package.json');
    const pkg = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    const name = pkg.packageManager.split('@') as Agent;
    return AGENTS.includes(name) ? name : null;
  } catch {
    return null;
  }
}

/** Detects the package manager used in the running process. */
export function fromUserAgent() {
  const userAgent = process.env.npm_config_user_agent;
  if (!userAgent) return null;
  const name = userAgent.split('/')[0] as Agent;
  return AGENTS.includes(name) ? name : null;
}

export const packman = {
  detect,
  fromLockFiles,
  fromPackageJson,
  fromUserAgent,
};

export default packman;
