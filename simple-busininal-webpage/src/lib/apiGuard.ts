import { NextRequest, NextResponse } from 'next/server'

export function apiHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    if (process.env.NEXT_PUBLIC_DISABLE_API === 'true') {
      return NextResponse.json({ error: 'API disabled in export' }, { status: 404 })
    }
    try {
      return await handler(req)
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  }
}
