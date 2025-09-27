import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

export const GET = async (req: NextRequest) => {
  try {
    const res = await prisma.manufacturer.findMany()
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const { id, ...body } = await req.json()
    const res = await prisma.manufacturer.create({ data: body })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}

export const PUT = async (req: NextRequest) => {
  try {
    const { id, ...body } = await req.json()
    const res = await prisma.manufacturer.update({
      where: {
        id: id,
      },
      data: body,
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
