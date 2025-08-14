// Server session tracking for authentication state validation
// This helps detect server restarts and invalidate stale client sessions

const SERVER_START_TIME = Date.now()

export function getServerStartTime(): number {
  return SERVER_START_TIME
}

export function isSessionStale(clientSessionTime: number): boolean {
  // If client session was created before server started, it's stale
  return clientSessionTime < SERVER_START_TIME
}

export function createSessionId(): string {
  return `${SERVER_START_TIME}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}