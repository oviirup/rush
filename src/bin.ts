#!/usr/bin/env node
import { printHelpText } from '~/helpers/help';
import { printVersionText } from '~/helpers/version';
import rush from '~/index';
import { RushFlags, RushOptions } from '~/types';
import mri from 'mri';

(async function main() {
  const args = process.argv.slice(2);
  const stdin = process.stdin;
  const stdout = process.stdout;
  const stderr = process.stderr;

  const stdio = { stdin, stdout, stderr };

  // parse cli flags
  const params = mri<RushFlags>(args, {
    string: ['max'],
    boolean: ['parallel', 'continue', 'silent', 'race', 'help', 'version'],
    alias: {
      p: 'parallel',
      c: 'continue',
      r: 'race',
      h: 'help',
      v: 'version',
    },
    default: {
      parallel: false,
      continue: false,
      max: 0,
      race: false,
      silent: false,
    } as Partial<RushFlags>,
  });

  // in case of help or version do not continue the process
  if (params.version) {
    return printVersionText(stdout);
  } else if (params.help) {
    return printHelpText(stdout);
  }

  const tasks = params._;
  const otps: RushOptions = {
    stdio,
    parallel: params.parallel,
    continue: params.continue,
    max: params.max,
    silent: params.silent,
    race: params.race,
  };

  try {
    await rush(tasks, otps);
  } catch (err) {
    console.error(err);
  }
})();
