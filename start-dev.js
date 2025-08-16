const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting Drufiy Development Environment...');

// Function to check if server is ready
function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Function to wait for server
async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`⏳ Waiting for Next.js server... (${i + 1}/${maxAttempts})`);
    
    if (await checkServer()) {
      console.log('✅ Next.js server is ready!');
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return false;
}

async function main() {
  // Start Next.js dev server
  console.log('📦 Starting Next.js development server...');
  const nextProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  // Wait for server to be ready
  const serverReady = await waitForServer();
  
  if (!serverReady) {
    console.error('❌ Next.js server failed to start');
    nextProcess.kill();
    process.exit(1);
  }

  // Start Electron
  console.log('⚡ Starting Electron...');
  const electronProcess = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  // Handle process cleanup
  electronProcess.on('close', (code) => {
    console.log('🔌 Electron closed');
    nextProcess.kill();
    process.exit(code);
  });

  nextProcess.on('close', (code) => {
    console.log('🔌 Next.js server closed');
    electronProcess.kill();
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    nextProcess.kill();
    electronProcess.kill();
    process.exit(0);
  });
}

main().catch(console.error);