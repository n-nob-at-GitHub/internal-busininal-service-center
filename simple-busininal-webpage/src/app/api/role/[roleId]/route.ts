import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

export async function GET(
  req: NextRequest, 
  { params }: { params: { roleId: string } },
) {
  try {
    const roleId = Number(params.roleId)
    const res = await prisma.role.findMany({
      where: {
        id: roleId,
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
  { params }: { params: { roleId: string } },
) {
  try {
    const roleId = Number(params.roleId)
    const res = await prisma.role.delete({
      where: {
        id: roleId,
      }
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
