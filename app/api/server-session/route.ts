import { NextResponse } from 'next/server'
import { getServerStartTime } from '../../../lib/server-session'

export async function GET() {
  return NextResponse.json({
    serverStartTime: getServerStartTime(),
    currentTime: Date.now()
  })
}