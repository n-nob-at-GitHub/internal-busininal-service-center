import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { 
  NextRequest, 
  NextResponse
} from 'next/server'

interface StockItem {
  id: number
  stockId?: number
  materialId: number
  unit: string
  quantity: number
  unitPrice: number
  isValid: boolean
  updatedBy: string
}

export const GET = async (req: NextRequest) => {
  try {
    const res = await prisma.outbound.findMany()
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}

export const PUT = async (req: NextRequest) => {
  try {
    const data: StockItem[] = await req.json()
    const items = Array.isArray(data) ? data : [ data ]
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: '更新データがありません' }, { status: 400 })
    }
    const res = await prisma.$transaction(
      items.map((item) => {
        const updateQuantity = item.isValid ? -item.quantity : item.quantity
        const updateAmount = item.isValid ? -item.quantity * item.unitPrice : item.quantity * item.unitPrice
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
          prisma.outbound.update({
            where: { id: item.id },
            data: {
              isValid: item.isValid,
              updatedBy: item.updatedBy ?? 'system',
            },
          }),
        ]
      }).flat()
    )
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
