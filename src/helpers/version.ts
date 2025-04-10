import pkg from '../../package.json';

/** Print a cli version */
export function printVersionText() {
  process.stdout.write(`v${pkg.version}\n`);
  return Promise.resolve(null);
}
