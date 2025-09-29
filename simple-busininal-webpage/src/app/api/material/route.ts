import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { NextRequest, NextResponse } from 'next/server'

const getMaterials = async (req: NextRequest) => {
  const res = await prisma.material.findMany()
  return NextResponse.json(res)
}

const postMaterial = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.material.create({ data: body })
  return NextResponse.json(res)
}

const putMaterial = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.material.update({
    where: {
      id: id,
    },
    data: body,
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getMaterials)
export const POST = apiHandler(postMaterial)
export const PUT = apiHandler(putMaterial)
