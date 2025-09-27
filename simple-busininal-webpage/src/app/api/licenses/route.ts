import sendMail from '@/lib/sendMail'
import {
  NextRequest, 
  NextResponse
} from 'next/server'

export async function GET(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('node:fs')
  try {
    const data = fs.readFileSync('licenses.json', 'utf8')
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(data))
    return NextResponse.json(data)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
