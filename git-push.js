#!/usr/bin/env node
/**
 * Push to GitHub and trigger Railway redeploy
 * Run with: node git-push.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const gitCommands = [
  ['git', 'remote', 'remove', 'origin'],
  ['git', 'remote', 'add', 'origin', 'https://github.com/Shanae124/protexxalearn.git'],
  ['git', 'push', '-u', 'origin', 'master']
];

console.log('\n🚀 ProtexxaLearn Git Push Script\n');

let commandIndex = 0;

function runCommand() {
  if (commandIndex >= gitCommands.length) {
    console.log('\n✅ All git operations completed!');
    console.log('Railway will auto-redeploy in a few moments...\n');
    process.exit(0);
  }

  const [cmd, ...args] = gitCommands[commandIndex];
  console.log(`Running: ${cmd} ${args.join(' ')}`);

  const proc = spawn(cmd, args, {
    cwd: path.join(__dirname),
    stdio: 'inherit',
    shell: true
  });

  proc.on('close', (code) => {
    if (code !== 0 && commandIndex < gitCommands.length - 1) {
      console.log(`⚠️ Command failed with code ${code}, continuing...\n`);
    } else if (code === 0) {
      console.log(`✓ Success\n`);
    } else {
      console.log(`❌ Push failed. Check credentials and try again.\n`);
    }
    commandIndex++;
    runCommand();
  });

  proc.on('error', (err) => {
    console.error('Error running command:', err);
    process.exit(1);
  });
}

runCommand();
