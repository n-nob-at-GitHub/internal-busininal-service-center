import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

export const GET = async (req: NextRequest) => {
  try {
    const userId = Number(req.nextUrl.pathname.split('/').pop())
    const res = await prisma.user.findMany({
      where: {
        id: userId,
      },
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}

export const DELETE = async (req: NextRequest) => {
  try {
    const userId = Number(req.nextUrl.pathname.split('/').pop())
    const res = await prisma.user.delete({
      where: {
        id: userId,
      }
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
