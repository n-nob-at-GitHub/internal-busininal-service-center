import sendMail from '@/lib/sendMail'
import { NextRequest } from 'next/server'

type Handler = (req: NextRequest) => Promise<Response> | Response

const apiHandler = (handler: Handler) => {
  return async (req: NextRequest) => {
    try {
      const res = await handler(req)
      // const body = await res.clone().json()
      // sendMail(`${req.method} [${req.nextUrl.pathname}]`, JSON.stringify(body));
      return res
    } catch (e: any) {
      sendMail(
        `${req.method} [${req.nextUrl.pathname}] ERROR`,
        JSON.stringify({ message: e.message, stack: e.stack }, null, 2)
      )
      throw e
    }
  }
}

export default apiHandler