import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { NextRequest, NextResponse } from 'next/server'

const getMaterials = async (req: NextRequest) => {
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
    quantity: m.quantity,
    fileName: m.fileName,
    isValid: m.isValid,
    stockId: m.stocks[0]?.id,
  }))
  return NextResponse.json(res)
}

export const GET = apiHandler(getMaterials)
