import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

export async function GET(
  req: NextRequest, 
  { params }: { params: { materialId: string } },
) {
  try {
    const materialId = Number(params.materialId)
    const res = await prisma.material.findMany({
      where: {
        id: materialId,
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
  { params }: { params: { materialId: string } },
) {
  try {
    const materialId = Number(params.materialId)
    const res = await prisma.material.delete({
      where: {
        id: materialId,
      }
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
