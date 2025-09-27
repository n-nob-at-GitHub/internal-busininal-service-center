export const dynamic = 'force-dynamic'
import prisma from '@/lib/prisma'
import sendMail from '@/lib/sendMail'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const res = await prisma.material.findMany()
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, ...body } = await req.json()
    const res = await prisma.material.create({ data: body })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...body } = await req.json()
    const res = await prisma.material.update({
      where: {
        id: id,
      },
      data: body,
    })
    // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(res))
    return NextResponse.json(res)
  } catch (e) {
    sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(e))
    throw e
  }
}
