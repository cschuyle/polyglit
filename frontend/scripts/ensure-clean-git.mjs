import {execSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

let status = '';
try {
  status = execSync('git status --porcelain', {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
} catch {
  console.error('deploy aborted: could not run git status');
  process.exit(1);
}

if (status) {
  console.error('deploy aborted: uncommitted changes in the repository:\n');
  console.error(status);
  console.error('\nCommit or stash your changes before running npm run deploy.');
  process.exit(1);
}
