import { quote } from 'shell-quote';

interface DefaultValues {
  [key: string]: string;
}

const ARGS_PATTERN = /\{(!)?([*@]|\d+)([^}]+)?}/g;

/**
 * Parses patterns and replaces placeholders with quoted arguments
 *
 * @param patterns Array of pattern strings to process
 * @param args Array of arguments to substitute into patterns
 * @returns Array of processed pattern strings
 */
function parsePatterns(patterns: string[], args: string[]): string[] {
  const hasPlaceholder = patterns.some((pattern) => ARGS_PATTERN.test(pattern));
  if (!hasPlaceholder) return patterns;

  const defaults: DefaultValues = Object.create(null);

  return patterns.map((pattern: string) =>
    pattern.replace(ARGS_PATTERN, (whole, mark, id, options) => {
      if (mark) throw Error(`Invalid Placeholder: ${whole}`);
      // Handle special placeholders
      if (id === '@') return quote(args);
      if (id === '*') return quote([args.join(' ')]);
      // Handle numeric placeholders
      const position = parseInt(id, 10);
      if (position >= 1 && position <= args.length) {
        return quote([args[position - 1]]);
      }
      // Handle default values
      if (options) {
        const prefix = options.slice(0, 2);
        const value = options.slice(2);
        switch (prefix) {
          case ':=':
            defaults[id] = quote([value]);
            return defaults[id];
          case ':-':
            return quote([value]);
          default:
            throw new Error(`Invalid Placeholder: ${whole}`);
        }
      }
      return defaults[id] ?? '';
    }),
  );
}

export default parsePatterns;
