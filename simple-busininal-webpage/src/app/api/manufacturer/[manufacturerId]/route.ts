import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const getManufacturer = async (req: NextRequest) => {
  const manufacturerId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.manufacturer.findMany({
    where: {
      id: manufacturerId,
    },
  })
  return NextResponse.json(res)
}

const deleteManufacturer = async (req: NextRequest) => {
  const manufacturerId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.manufacturer.delete({
    where: {
      id: manufacturerId,
    }
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getManufacturer)
export const DELETE = apiHandler(deleteManufacturer)
