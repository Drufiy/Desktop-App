const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting Drufiy in development mode...');

// Function to check if Next.js server is ready
function checkServer(url, callback) {
  const req = http.get(url, (res) => {
    if (res.statusCode === 200) {
      callback(true);
    } else {
      callback(false);
    }
  });
  
  req.on('error', () => {
    callback(false);
  });
  
  req.setTimeout(1000, () => {
    req.destroy();
    callback(false);
  });
}

// Function to wait for server to be ready
function waitForServer(url, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    function check() {
      attempts++;
      console.log(`⏳ Checking server... (${attempts}/${maxAttempts})`);
      
      checkServer(url, (isReady) => {
        if (isReady) {
          console.log('✅ Next.js server is ready!');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Server failed to start within timeout'));
        } else {
          setTimeout(check, 2000);
        }
      });
    }
    
    check();
  });
}

// Start Next.js dev server
const nextDev = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true
});

// Log Next.js output
nextDev.stdout.on('data', (data) => {
  process.stdout.write(data);
});

nextDev.stderr.on('data', (data) => {
  process.stderr.write(data);
});

// Wait for Next.js to be ready, then launch Electron
waitForServer('http://localhost:3000')
  .then(() => {
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
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error.message);
    nextDev.kill();
    process.exit(1);
  });

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