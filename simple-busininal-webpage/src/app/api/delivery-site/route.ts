import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const getDeliverySites = async (req: NextRequest) => {
  const res = await prisma.deliverySite.findMany()
  return NextResponse.json(res)
}

const postDeliverySite = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.deliverySite.create({ data: body })
  return NextResponse.json(res)
}

const putDeliverySite = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.deliverySite.update({
    where: {
      id: id,
    },
    data: body,
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getDeliverySites)
export const POST = apiHandler(postDeliverySite)
export const PUT = apiHandler(putDeliverySite)
