import picomatch from 'picomatch';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const CONVERT_MAP: Record<string, string> = { ':': '/', '/': ':' };
/** Swaps ":" and "/", in order to use ":" as the separator in minimatch. */
function swapColonAndSlash(sourceString: string): string {
  return sourceString.replace(/[:/]/g, (matched) => CONVERT_MAP[matched]);
}

type TaskFilter = {
  match: (str: string) => boolean;
  task: string;
  args: string;
};
/**
 * Creates a filter object from a pattern string to match against task names.
 *
 * @param pattern The pattern string to create a filter from
 * @returns A Filter object containing:
 *
 *   - `match`: A function that tests if a string matches the pattern
 *   - `task`: The original task name from the pattern
 *   - `args`: Any arguments specified after the task name
 */
function createFilter(pattern: string): TaskFilter {
  const trimmed = pattern.trim();
  const [task, ...rest] = trimmed.split(' ');
  const args = rest.join(' ');

  const matcher = picomatch(swapColonAndSlash(task), { nonegate: true });
  const match = matcher.bind(matcher);

  return { match, task, args };
}

/**
 * A set to track and deduplicate tasks based on their source. Prevents the same
 * task from being added multiple times from different sources.
 */
class TaskSet {
  private readonly result: string[] = [];
  private readonly sourceMap: Record<string, string[]> = {};
  /**
   * Adds a command to the set if it hasn't been added from a different source.
   *
   * @param command - The command to add
   * @param source - The source of the command
   */
  add(task: string, args: string, source: string): void {
    const command = `${task} ${args}`;
    const sources = this.getSources(command);
    if (sources.length === 0 || sources.includes(source)) {
      this.result.push(command);
    }
    sources.push(source);
  }
  /** Gets or initializes sources for a command */
  private getSources(cmd: string): string[] {
    this.sourceMap[cmd] ??= [];
    return this.sourceMap[cmd];
  }
  /** Gets the list of unique commands */
  getResult(): string[] {
    return this.result;
  }
}

/**
 * Finds and returns tasks that match the given patterns.
 *
 * @param taskList List of available tasks
 * @param patterns Patterns to match against tasks
 * @returns Array of matching tasks
 * @throws Error if any pattern doesn't match any tasks
 */
function parseTasks(taskList: string[], patterns: string[]): string[] {
  const filters = patterns.map(createFilter);
  const candidates = taskList.map(swapColonAndSlash);
  const taskSet = new TaskSet();
  const unknownTasks = new Set<string>();

  for (const filter of filters) {
    let found = false;
    // Try to match against available tasks
    for (const candidate of candidates) {
      if (filter.match(candidate)) {
        taskSet.add(swapColonAndSlash(candidate), filter.args, filter.task);
        found = true;
      }
    }
    // Check for built-in tasks
    if (!found && ['restart', 'env'].includes(filter.task)) {
      taskSet.add(filter.task, filter.args, filter.task);
      found = true;
    }
    if (!found) {
      unknownTasks.add(filter.task);
    }
  }

  if (unknownTasks.size > 0) {
    const tasks = Array.from(unknownTasks).join('", ');
    throw new Error(`Task not found: "${tasks}"`);
  }

  return taskSet.getResult();
}

export default parseTasks;
