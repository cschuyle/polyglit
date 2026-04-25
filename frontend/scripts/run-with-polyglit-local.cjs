#!/usr/bin/env node
/**
 * Create React App only inlines env vars prefixed with REACT_APP_.
 * When POLYGLIT_LOCAL is set, mirror it so the client bundle can use fixtures.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const v = process.env.POLYGLIT_LOCAL;
if (v && v !== '0' && v !== 'false') {
  process.env.REACT_APP_POLYGLIT_LOCAL = '1';
}

const frontendRoot = path.join(__dirname, '..');
const rsBin = path.join(
  frontendRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'react-scripts.cmd' : 'react-scripts'
);

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: run-with-polyglit-local.cjs <start|build|test|...> [extra args]');
  process.exit(1);
}

const fixturesSrc = path.join(frontendRoot, '..', 'fixtures');
const fixturesDest = path.join(frontendRoot, 'public', 'fixtures');

function syncFixturesIntoPublic() {
  fs.rmSync(fixturesDest, { recursive: true, force: true });
  fs.cpSync(fixturesSrc, fixturesDest, { recursive: true });
}

function removeFixturesFromPublic() {
  fs.rmSync(fixturesDest, { recursive: true, force: true });
}

const isLocalBuild = args[0] === 'build' && process.env.REACT_APP_POLYGLIT_LOCAL;
if (isLocalBuild) {
  syncFixturesIntoPublic();
}

let status = 1;
try {
  const result = spawnSync(rsBin, args, {
    cwd: frontendRoot,
    env: process.env,
    stdio: 'inherit',
  });
  status = result.status ?? 1;
} finally {
  if (isLocalBuild) {
    removeFixturesFromPublic();
  }
}

process.exit(status);
