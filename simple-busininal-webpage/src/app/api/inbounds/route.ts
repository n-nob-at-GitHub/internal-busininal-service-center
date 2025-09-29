import prisma from '@/lib/prisma'
import { Inbound } from '@prisma/client'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const postInbounds = async (req: NextRequest) => {
  const body: Inbound[] = await req.json()
  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ message: '登録データがありません' }, { status: 400 })
  }
  const res = await prisma.inbound.createMany({ data: body })
  return NextResponse.json(res)
}

export const POST = apiHandler(postInbounds)
