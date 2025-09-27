// https://nodejs.keicode.com/nodejs/nodemailer.php
// https://myaccount.google.com/apppasswords
// eslint-disable-next-line @typescript-eslint/no-require-imports
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

const sendMail = async (subject: string, text: string) => {
  try {
    const transport = nodemailer.createTransport(options)
    const res = await transport.sendMail({
      from: process.env.MAIL_FROM_ADDRESS,
      to: process.env.MAIL_TO_ADDRESS,
      subject: subject,
      text: text,
    })
    console.log(res);
  } catch (e) {
    console.log(e);
  }
}

export default sendMail