// https://nodejs.keicode.com/nodejs/nodemailer.php
// https://myaccount.google.com/apppasswords
import { NextRequest, NextResponse } from 'next/server'
const nodemailer = require('nodemailer')

const options = {
  host: process.env.MAIL_SMTP_SERVER,
  port: process.env.MAIL_SMTP_PORT,
  secure: false,
  requireTLS: false,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.MAIL_AUTH_ADDRESS,
    pass: process.env.MAIL_AUTH_PASS,
  },
}

export async function POST (req: NextRequest) {
  const params = await req.json()
  const mail = {
    from: process.env.MAIL_FROM_ADDRESS,
    to: process.env.MAIL_TO_ADDRESS,
    subject: params.subject,
    text: params.text,
  }

  try {
    const transport = nodemailer.createTransport(options)
    await transport.sendMail(mail)
    return NextResponse.json({ message: 'Email sent successfully.' })
  } catch (e) {
    return NextResponse.json({ message: 'Email sending failed.' })
  }
}
