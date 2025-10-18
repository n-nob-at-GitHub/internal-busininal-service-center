const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
} = require('@aws-sdk/client-dynamodb')
const {
  marshall, 
  unmarshall
} = require('@aws-sdk/util-dynamodb')
const { sendNotification } = require('./lib/snsNotifier')

const INBOUND_TABLE = process.env.INBOUND_TABLE
const INBOUND_PREFIX = `${ INBOUND_TABLE.toUpperCase() }#`
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
}
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })

async function getNextInboundId() {
  const scanParams = {
    TableName: INBOUND_TABLE,
    ProjectionExpression: 'PK',
    FilterExpression: 'begins_with(PK, :p)',
    ExpressionAttributeValues: {
      ':p': { S: INBOUND_PREFIX },
    },
  }

  const res = await ddbClient.send(new ScanCommand(scanParams))
  const items = res.Items || []
  let max = 0
  for (const it of items) {
    const obj = unmarshall(it)
    if (!obj.PK) continue
    const pk = obj.PK
    const num = Number(String(pk).replace(INBOUND_PREFIX, ''))
    if (!Number.isNaN(num) && num > max) max = num
  }
  return max + 1
}

exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method
  let body = null

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

  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  if (!body || !Array.isArray(body) || body.length === 0) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: '登録データがありません' }),
    }
  }

  try {
    const created = []
    let nextId = await getNextInboundId()

    for (const entry of body) {
      const id = nextId++
      const now = new Date().toISOString()
      const stockId = entry.stockId === null || entry.stockId === undefined
        ? null
        : Number(entry.stockId)

      const item = {
        PK: `${ INBOUND_PREFIX }${ id }`,
        SK: 'DETAIL',
        stockId: stockId,
        quantity: Number(entry.quantity ?? 0),
        amount: entry.amount ?? ((Number(entry.quantity ?? 0)) * (Number(entry.price ?? 0))),
        unit: entry.unit ?? '',
        isValid: entry.isValid === undefined ? true : !!entry.isValid,
        createdAt: entry.createdAt ?? now,
        createdBy: entry.createdBy ?? entry.updatedBy ?? 'system',
        updatedAt: entry.updatedAt ?? now,
        updatedBy: entry.updatedBy ?? entry.createdBy ?? 'system',
      }

      const putParams = {
        TableName: INBOUND_TABLE,
        Item: marshall(item, { removeUndefinedValues: true }),
      }

      await ddbClient.send(new PutItemCommand(putParams))
      created.push({
        id,
        stockId: item.stockId,
        quantity: item.quantity,
        amount: item.amount,
        unit: item.unit,
        isValid: item.isValid,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
      })
    }
    
    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify(created),
    }
  } catch (err) {
    console.error('Error inserting inbound item:', err, { entry: body })
    await sendNotification(
      '【api/inboundsエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    )
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message || 'Internal error' }),
    }
  }
}
