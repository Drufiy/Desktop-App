const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Drufiy in development mode...');

// Start Next.js dev server
const nextDev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for Next.js to start, then launch Electron
setTimeout(() => {
  console.log('⚡ Launching Electron...');
  const electron = spawn('npm', ['run', 'electron'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  electron.on('close', (code) => {
    console.log('🔌 Electron closed with code:', code);
    nextDev.kill();
    process.exit(code);
  });
}, 5000); // Wait 5 seconds for Next.js to start

nextDev.on('close', (code) => {
  console.log('🔌 Next.js dev server closed with code:', code);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  nextDev.kill();
  process.exit(0);
}); 