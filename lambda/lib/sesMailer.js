const {
  SESClient,
  SendEmailCommand
} = require('@aws-sdk/client-ses');

const SES_FROM = process.env.SES_FROM;
const SES_TO = process.env.SES_TO;
const sesClient = new SESClient({ region: process.env.AWS_REGION });

async function sendErrorEmail(subject, message) {
  const params = {
    Destination: { ToAddresses: [ SES_TO ] },
    Message: {
      Body: { Text: { Data: message } },
      Subject: { Data: subject },
    },
    Source: SES_FROM,
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log('Error email sent to:', SES_TO);
  } catch (mailErr) {
    console.error('Failed to send error email:', mailErr);
  }
}

module.exports = { sendErrorEmail };
