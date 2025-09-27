export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import { Inbound } from '@prisma/client'
import sendMail from '@/lib/sendMail'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body: Inbound[] = await req.json()
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ message: '登録データがありません' }, { status: 400 })
    }
    const res = await prisma.inbound.createMany({ data: body })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}