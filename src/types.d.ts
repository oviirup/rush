export type NodeStdio = {
  stdin: typeof process.stdin;
  stdout: typeof process.stdout;
  stderr: typeof process.stderr;
};

export type RushOptions = {
  /**
   * NodeJS stdio (optional)\
   * Default : {}
   */
  stdio?: Partial<NodeStdio>;
  /**
   * If 'true' run scripts parallelly, otherwise sequentially\
   * Default: false
   */
  parallel?: boolean;
  /**
   * Ignore errors in running tasks and continue\
   * Default: false
   */
  continue?: boolean;
  /**
   * Set the maximum running tasks in parallel\
   * Default: 0
   */
  max?: number;
  /**
   * Set log level of npm to 'silent'\
   * Default: false
   */
  silent?: boolean;
  /**
   * If 'true' kill all tasks if one of them exit with error\
   * Default: false
   */
  race?: boolean;
};

export type RushFlags = {
  version?: boolean;
  help?: boolean;
} & RushOptions;
