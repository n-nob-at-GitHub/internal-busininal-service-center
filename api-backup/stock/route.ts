import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

const getStocks = async (req: NextRequest) => {
  const res = await prisma.stock.findMany()
  return NextResponse.json(res)
}

export const GET = apiHandler(getStocks)
