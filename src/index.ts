import { printHelpText } from './helpers/help';
import { printVersionText } from './helpers/version';
import mri from 'mri';

export type RushArgs = {
  max: string;
  continue: boolean;
  serial: boolean;
  silent: boolean;
  race: boolean;
  version: boolean;
  help: boolean;
};

export function rush(args: string[]) {
  const stdout = process.stdout;
  const params = mri<RushArgs>(args, {
    string: ['max'],
    boolean: ['continue', 'sequential', 'serial', 'silent', 'race'],
    alias: {
      s: ['sequential', 'serial'],
      c: 'continue',
      r: 'race',
      h: 'help',
      v: 'version',
    },
    default: {
      serial: false,
      max: '0',
      continue: false,
      race: false,
      silent: false,
    } as Partial<RushArgs>,
  });

  // in case of help or version do not continue the process
  if (params.version) {
    return printVersionText(stdout);
  } else if (params.help) {
    return printHelpText(stdout);
  }
}

export default rush;
