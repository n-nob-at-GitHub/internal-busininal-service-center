import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const getDeliverySites = async (req: NextRequest) => {
  const deliverySiteId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.deliverySite.findMany({
    where: { id: deliverySiteId },
  })
  return NextResponse.json(res)
}

const deleteDeliverySite = async (req: NextRequest) => {
  const deliverySiteId = Number(req.nextUrl.pathname.split('/').pop())
  const res = await prisma.deliverySite.delete({
    where: {
      id: deliverySiteId,
    }
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getDeliverySites)
export const DELETE = apiHandler(deleteDeliverySite)
