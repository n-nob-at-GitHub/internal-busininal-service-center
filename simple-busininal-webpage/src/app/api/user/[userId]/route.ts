import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const getUser = async (req: NextRequest) => {
  const userId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.user.findMany({
    where: {
      id: userId,
    },
  })
  return NextResponse.json(res)
}

const deleteUser = async (req: NextRequest) => {
  const userId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.user.delete({
    where: {
      id: userId,
    }
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getUser)
export const DELETE = apiHandler(deleteUser)
