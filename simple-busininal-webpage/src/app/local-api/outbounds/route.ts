import prisma from '@/lib/prisma'
import { Outbound } from '@prisma/client'
import sendMail from '@/lib/sendMail'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

export const POST = async (req: NextRequest) => {
  try {
    const body: Outbound[] = await req.json()
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ message: '登録データがありません' }, { status: 400 })
    }
    const res = await prisma.outbound.createMany({ data: body })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
