export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
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

export async function PUT(req: NextRequest) {
  try {
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
              totalQuantity: { decrement: item.quantity },
              totalAmount: { decrement: item.quantity * item.price },
              unit: item.unit,
              updatedBy: item.updatedBy,
            },
          })
        }
      })
    )
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}