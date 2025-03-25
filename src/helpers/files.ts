import internalFS from 'fs/promises';

async function exists(path: string, type: 'file' | 'dir') {
  try {
    const stat = await internalFS.stat(path);
    return type === 'file' ? stat.isFile() : stat.isDirectory();
  } catch {
    return false;
  }
}

const fs = Object.assign(internalFS, {
  exists,
});

export default fs;
