type Group = {
  parallel: boolean;
  patterns: string[];
};

const CONCAT_PATTERN = /^-[psclr]+$/;

export class ArgumentSet {
  continueOnError: boolean;
  maxParallel: number;
  race: boolean;
  silent: boolean;
  groups: Group[] = [];
  arguments: string[] = [];
  printLabel: boolean;

  constructor(initialValue: Partial<Group> = {}) {
    this.continueOnError = false;
    this.maxParallel = 0;
    this.race = false;
    this.silent = process.env.npm_config_loglevel === 'silent';
    this.printLabel = false;

    this.addGroup(initialValue);
  }

  addGroup(group: Partial<Group> = {}) {
    const newGroup = { parallel: false, patterns: [] };
    this.groups.push(Object.assign(newGroup, group));
  }

  get lastGroup() {
    return this.groups[this.groups.length - 1];
  }

  get parallel() {
    return this.groups.some((group) => group.parallel);
  }
}

function processArguments(set: ArgumentSet, args: string[]) {
  LOOP: for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--':
        set.arguments = args.slice(i + 1);
        break LOOP;
      case '-c':
      case '--continue':
        set.continueOnError = true;
        break;
      case '-r':
      case '--race':
        set.race = true;
        break;
      case '--silent':
        set.silent = true;
        break;
      case '--max':
      case '--max-parallel':
        set.maxParallel = parseInt(args[++i], 10);
        if (!Number.isFinite(set.maxParallel) || set.maxParallel <= 0) {
          throw new Error(`Invalid Option: --max ${args[i]}`);
        }
        break;
      case '-l':
      case '--print-label':
        set.printLabel = true;
        break;
      case '-s':
      case '--sequential':
      case '--serial':
        set.addGroup();
        break;
      case '-p':
      case '--parallel':
        set.addGroup({ parallel: true });
        break;
      default: {
        if (CONCAT_PATTERN.test(arg)) {
          // prettier-ignore
          const concatArgs = arg.slice(1).split('').map((c)=>`-${c}`);
          processArguments(set, concatArgs);
        } else if (arg[0] === '-') {
          throw new Error(`Invalid Option: ${arg}`);
        } else {
          set.lastGroup.patterns.push(arg);
        }
      }
    }
  }
  return set;
}

function parseArgv(args: string[]) {
  const set = new ArgumentSet({ parallel: false });
  return processArguments(set, args);
}

export default parseArgv;
