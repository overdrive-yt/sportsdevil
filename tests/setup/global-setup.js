// Global test setup
// Runs once before all tests

const { spawn } = require('child_process')
const { promisify } = require('util')
const sleep = promisify(setTimeout)

let serverProcess

module.exports = async () => {
  console.log('🚀 Starting test server...')
  
  // Start Next.js development server for testing
  serverProcess = spawn('npm', ['run', 'dev:stable'], {
    stdio: 'pipe',
    detached: false,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3001',
      SUPPRESS_NO_CONFIG_WARNING: 'true'
    }
  })

  // Wait for server to be ready
  let serverReady = false
  let attempts = 0
  const maxAttempts = 60 // 60 seconds timeout

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString()
    if (output.includes('Ready in')) {
      serverReady = true
    }
  })

  serverProcess.stderr.on('data', (data) => {
    // Log errors but don't fail setup unless critical
    const error = data.toString()
    if (!error.includes('Warning') && !error.includes('Sentry')) {
      console.error('Server error:', error)
    }
  })

  // Wait for server to be ready
  while (!serverReady && attempts < maxAttempts) {
    await sleep(1000)
    attempts++
  }

  if (!serverReady) {
    console.error('❌ Test server failed to start within 60 seconds')
    process.exit(1)
  }

  console.log('✅ Test server ready')

  // Store server process globally for cleanup
  global.__SERVER_PROCESS__ = serverProcess
}