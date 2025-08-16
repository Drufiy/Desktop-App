// Simple test to check if Next.js starts properly
const { spawn } = require('child_process');

console.log('🧪 Testing Next.js startup...');

const nextProcess = spawn('npx', ['next', 'dev', '--port', '3001'], {
  stdio: 'inherit',
  shell: true
});

setTimeout(() => {
  console.log('⏹️ Stopping test server...');
  nextProcess.kill();
}, 10000);

nextProcess.on('close', (code) => {
  console.log(`Test completed with code: ${code}`);
  process.exit(code);
});