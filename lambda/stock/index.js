const {
  DynamoDBClient,
  ScanCommand,
} = require('@aws-sdk/client-dynamodb')
const { sendNotification } = require('../lib/snsNotifier')

const STOCK_TABLE = process.env.STOCK_TABLE
const STOCK_PREFIX = `${ STOCK_TABLE }#`
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
}
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })

exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method
  const pathParams = event.pathParameters || {}
  let body = {}

  if (event.body) {
    try {
      body = JSON.parse(event.body)
    } catch {
      console.warn('Invalid JSON:', event.body)
    }
  }

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    }
  }

  try {
    if (method === 'GET' && !pathParams.id) {
      const res = await ddbClient.send(new ScanCommand({
        TableName: STOCK_TABLE,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': { S: STOCK_PREFIX } },
      }))

      const items = res.Items?.map(item => ({
        id: Number(item.PK.S.replace(STOCK_PREFIX, '')),
        materialId: Number(item.materialId?.N),
        totalQuantity: Number(item.totalQuantity?.N),
        totalAmount: Number(item.totalAmount?.N),
        unit: item.unit?.S || '',
        note: item.note?.S || '',
        createdAt: item.createdAt?.S || '',
        createdBy: item.createdBy?.S || '',
        updatedAt: item.updatedAt?.S || '',
        updatedBy: item.updatedBy?.S || '',
      })) || []

      items.sort((a, b) => a.id - b.id)

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(items),
      }
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }

  } catch (err) {
    console.error(err)
    await sendNotification(
      '【api/stockエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    )
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message }),
    }
  }
}
