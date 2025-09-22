import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const materials = await prisma.material.findMany({
      include: {
        stocks: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    })
    const res = materials.map(m => ({
      id: m.id,
      name: m.name,
      unit: m.unit,
      price: m.price,
      fileName: m.fileName,
      stockId: m.stocks[0]?.id,
    }))
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
