export type NodeStdio = {
  stdin: typeof process.stdin;
  stdout: typeof process.stdout;
  stderr: typeof process.stderr;
};

export type RushOptions = {
  cwd?: string;
  io?: NodeStdio;
  scripts: string[];
  arguments?: string[];
  parallel?: boolean;
  continueOnError?: boolean;
  printLabel?: boolean;
  maxParallel?: number;
  silent?: boolean;
  race?: boolean;
};

export type PackageJSON = {
  name: string;
  version: string;
  main?: string;
  types?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  license?: string;
};
