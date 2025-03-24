import pkg from '../../package.json';

/**
 * Print a cli version
 *
 * @private
 * @param output - A writable stream to print.
 */
export function printVersionText(output: NodeJS.WriteStream) {
  output.write(`v${pkg.version}\n`);
  return Promise.resolve(null);
}
