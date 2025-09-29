import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const getRole = async (req: NextRequest) => {
  const roleId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.role.findMany({
    where: {
      id: roleId,
    },
  })
  return NextResponse.json(res)
}

const deleteRole = async (req: NextRequest) => {
  const roleId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.role.delete({
    where: {
      id: roleId,
    }
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getRole)
export const DELETE = apiHandler(deleteRole)
