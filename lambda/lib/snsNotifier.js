const {
  SNSClient,
  PublishCommand
} = require("@aws-sdk/client-sns");

const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

async function sendErrorNotification(subject, message) {
  const params = {
    TopicArn: SNS_TOPIC_ARN,
    Subject: subject,
    Message: message,
  };

  try {
    await snsClient.send(new PublishCommand(params));
    console.log("Error notification sent via SNS:", subject);
  } catch (err) {
    console.error("Failed to send SNS notification:", err);
  }
}

module.exports = { sendErrorNotification };
