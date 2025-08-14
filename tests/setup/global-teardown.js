// Global test teardown
// Runs once after all tests

module.exports = async () => {
  console.log('🧹 Cleaning up test environment...')
  
  // Kill the test server
  if (global.__SERVER_PROCESS__) {
    console.log('Stopping test server...')
    global.__SERVER_PROCESS__.kill('SIGTERM')
    
    // Give it time to shut down gracefully
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('✅ Test cleanup complete')
}