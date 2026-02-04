const { spawn } = require('child_process');
const path = require('path');

const nextPort = process.env.PORT || '3000';
const apiPort = process.env.API_PORT || '5000';

const api = spawn(process.execPath, ['server-mock.js'], {
  env: { ...process.env, PORT: apiPort },
  stdio: 'inherit'
});

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const web = spawn(process.execPath, [nextBin, 'start', '-p', nextPort], {
  env: { ...process.env },
  stdio: 'inherit'
});

const shutdown = (code) => {
  if (!api.killed) api.kill('SIGTERM');
  if (!web.killed) web.kill('SIGTERM');
  process.exit(code);
};

api.on('exit', (code) => shutdown(code ?? 0));
web.on('exit', (code) => shutdown(code ?? 0));

process.on('SIGTERM', () => shutdown(0));
process.on('SIGINT', () => shutdown(0));
