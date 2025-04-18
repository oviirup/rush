export type NodeStdio = {
  stdin: typeof process.stdin;
  stdout: typeof process.stdout;
  stderr: typeof process.stderr;
};

export type RushOptions = {
  /** The current working directory */
  cwd?: string;
  /** The node.js input/output/error streams */
  io?: NodeStdio;
  /** The npm scripts to run */
  scripts: string[];
  /** The arguments to pass to the npm scripts */
  arguments?: string[];
  /** Run the group of tasks in parallel */
  parallel?: boolean;
  /** Continue running tasks even if one fails */
  continueOnError?: boolean;
  /** Print the label of the tasks */
  printLabel?: boolean;
  /** The maximum number of tasks to run in parallel */
  maxParallel?: number;
  /** Suppress all output */
  silent?: boolean;
  /** Abort all tasks if one fails */
  race?: boolean;
  /** The path to the npm executable */
  npmPath?: string;
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
