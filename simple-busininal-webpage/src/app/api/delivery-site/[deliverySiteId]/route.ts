import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

interface Params {
  params: { deliverySiteId: string }
}

export async function GET(
  req: NextRequest, 
  { params }: Params,
) {
  try {
    const deliverySiteId = Number(params.deliverySiteId)
    const res = await prisma.deliverySite.findMany({
      where: {
        id: deliverySiteId,
      },
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: Params,
) {
  try {
    const deliverySiteId = Number(params.deliverySiteId)
    const res = await prisma.deliverySite.delete({
      where: {
        id: deliverySiteId,
      }
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
