import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const getManufacturers = async (req: NextRequest) => {
  const res = await prisma.manufacturer.findMany()
  return NextResponse.json(res)
}

const postManufacturer = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.manufacturer.create({ data: body })
  return NextResponse.json(res)
}

const putManufacturer = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.manufacturer.update({
    where: {
      id: id,
    },
    data: body,
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getManufacturers)
export const POST = apiHandler(postManufacturer)
export const PUT = apiHandler(putManufacturer)
