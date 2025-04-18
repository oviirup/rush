import path from 'path';
import { PackageJSON } from '../types';
import fs from './files';

async function readPackageJson(cwd: string) {
  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    const pkg = await fs.readJson<PackageJSON>(packageJsonPath);
    const scripts = pkg.scripts ? Object.keys(pkg.scripts) : [];
    return scripts;
  } catch {
    return [];
  }
}

export default readPackageJson;
