import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

interface StockItem {
  id: number
  stockId?: number
  materialId: number
  amount: number
  unit: string
  quantity: number
  isValid: boolean
  updatedBy: string
}

const getInbounds = async (req: NextRequest) => {
  const res = await prisma.inbound.findMany()
  return NextResponse.json(res)
}

const putInbound = async (req: NextRequest) => {
  const data: StockItem[] = await req.json()
  const items = Array.isArray(data) ? data : [ data ]
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: '更新データがありません' }, { status: 400 })
  }
  const res = await prisma.$transaction(
    items.map((item) => {
      console.log(item.amount)
      const updateQuantity = item.isValid ? item.quantity : -item.quantity
      const updateAmount = item.isValid ? item.amount : -item.amount
      return [
        prisma.stock.update({
          where: { id: item.stockId },
          data: {
            totalQuantity: { increment: updateQuantity },
            totalAmount: { increment: updateAmount },
            unit: item.unit,
            updatedBy: item.updatedBy ?? 'system',
          },
        }),
        prisma.inbound.update({
          where: { id: item.id },
          data: {
            isValid: item.isValid,
            updatedBy: item.updatedBy ?? 'system',
          },
        }),
      ]
    }).flat()
  )
  return NextResponse.json(res)
}

export const GET = apiHandler(getInbounds)
export const PUT = apiHandler(putInbound)
