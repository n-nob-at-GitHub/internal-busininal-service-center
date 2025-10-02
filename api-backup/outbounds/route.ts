import prisma from '@/lib/prisma'
import { Outbound } from '@prisma/client'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const postOutbounds = async (req: NextRequest) => {
  const body: Outbound[] = await req.json()
  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ message: '登録データがありません' }, { status: 400 })
  }
  const res = await prisma.outbound.createMany({ data: body })
  return NextResponse.json(res)
}

export const POST = apiHandler(postOutbounds)
