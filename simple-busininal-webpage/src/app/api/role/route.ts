import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const getRoles = async (req: NextRequest) => {
  const res = await prisma.role.findMany()
  return NextResponse.json(res)
}

const postRole = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.role.create({ data: body })
  return NextResponse.json(res)
}

const putRole = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.role.update({
    where: {
      id: id,
    },
    data: body,
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getRoles)
export const POST = apiHandler(postRole)
export const PUT = apiHandler(putRole)
