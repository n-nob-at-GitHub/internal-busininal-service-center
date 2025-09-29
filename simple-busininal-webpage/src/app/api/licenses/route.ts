import apiHandler from '@/lib/apiHandler'
import {
  NextRequest, 
  NextResponse
} from 'next/server'

const getLicenses = async (req: NextRequest) => {
  const fs = require('node:fs')
  const data = fs.readFileSync('licenses.json', 'utf8')
  return NextResponse.json(data)
}

export const GET = apiHandler(getLicenses)
