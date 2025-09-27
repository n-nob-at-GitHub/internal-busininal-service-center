import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { apiHandler } from '@/lib/apiGuard'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

export const GET = apiHandler(async (req: NextRequest) => {
  try {
    const manufacturerId = Number(req.nextUrl.pathname.split('/').pop())
    const res = await prisma.manufacturer.findMany({
      where: {
        id: manufacturerId,
      },
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
})

export const DELETE = apiHandler(async (req: NextRequest) => {
  try {
    const manufacturerId = Number(req.nextUrl.pathname.split('/').pop())
    const res = await prisma.manufacturer.delete({
      where: {
        id: manufacturerId,
      }
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
})
