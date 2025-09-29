import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const getMaterial = async (req: NextRequest) => {
  const materialId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.material.findMany({
    where: {
      id: materialId,
    },
  })
  return NextResponse.json(res)
}

const deleteMaterial = async (req: NextRequest) => {
  const materialId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.material.delete({
    where: {
      id: materialId,
    }
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getMaterial)
export const DELETE = apiHandler(deleteMaterial)
