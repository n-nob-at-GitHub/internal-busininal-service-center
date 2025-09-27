import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

export async function GET(
  req: NextRequest, 
  { params }: { params: { manufacturerId: string } },
) {
  try {
    const manufacturerId = Number(params.manufacturerId)
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
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { manufacturerId: string } },
) {
  try {
    const manufacturerId = Number(params.manufacturerId)
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
}
