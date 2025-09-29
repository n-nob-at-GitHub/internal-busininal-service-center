import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

interface StockItem {
  stockId?: number
  materialId: number
  unit: string
  quantity: number
  price: number
  updatedBy: string
}

const putStock = async (req: NextRequest) => {
  const items: StockItem[] = await req.json()
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: '更新データがありません' }, { status: 400 })
  }
  const res = await prisma.$transaction(
    items.map((item) => {
      if (!item.stockId) {
        return prisma.stock.create({
          data: {
            materialId: item.materialId,
            totalQuantity: item.quantity,
            totalAmount: item.quantity * item.price,
            unit: item.unit,
            createdBy: item.updatedBy,
            updatedBy: item.updatedBy,
          },
        })
      } else {
        return prisma.stock.update({
          where: { id: item.stockId },
          data: {
            totalQuantity: { increment: item.quantity },
            totalAmount: { increment: item.quantity * item.price },
            unit: item.unit,
            updatedBy: item.updatedBy,
          },
        })
      }
    })
  )
  return NextResponse.json(res)
}

export const PUT = apiHandler(putStock)
