import prisma from '@/lib/prisma'
import apiHandler from '@/lib/apiHandler'
import { NextRequest, NextResponse } from 'next/server'

const getUsers = async (req: NextRequest) => {
  const res = await prisma.user.findMany()
  return NextResponse.json(res)
}

const postUser = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.user.create({ data: body })
  return NextResponse.json(res)
}

const putUser = async (req: NextRequest) => {
  const { id, ...body } = await req.json()
  const res = await prisma.user.update({
    where: {
      id: id,
    },
    data: body,
  })
  return NextResponse.json(res)
}

export const GET = apiHandler(getUsers)
export const POST = apiHandler(postUser)
export const PUT = apiHandler(putUser)
