import node_fs from 'fs/promises';

async function exists(path: string, type: 'file' | 'dir') {
  try {
    const stat = await node_fs.stat(path);
    return type === 'file' ? stat.isFile() : stat.isDirectory();
  } catch {
    return false;
  }
}

const fs = Object.assign(node_fs, {
  exists,
});

export default fs;
