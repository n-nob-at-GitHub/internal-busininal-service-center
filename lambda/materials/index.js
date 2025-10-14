const {
  DynamoDBClient,
  ScanCommand,
  QueryCommand,
} = require('@aws-sdk/client-dynamodb')
const { sendNotification } = require('./lib/snsNotifier')

const MATERIAL_TABLE = process.env.MATERIAL_TABLE
const STOCK_TABLE = process.env.STOCK_TABLE
const MATERIAL_PREFIX = `${ MATERIAL_TABLE }#`
const STOCK_PREFIX = `${ STOCK_TABLE }#`
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
}
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })

exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    }
  }

  if (method !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const materialRes = await ddbClient.send(
      new ScanCommand({
        TableName: MATERIAL_TABLE,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': { S: MATERIAL_PREFIX } },
      })
    )

    const materials = materialRes.Items || []

    const results = await Promise.all(
      materials.map(async (m) => {
        const materialId = Number(m.PK.S.replace(MATERIAL_PREFIX, ''))

        const stockRes = await ddbClient.send(
          new QueryCommand({
            TableName: STOCK_TABLE,
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: { ':pk': { S: `${ STOCK_PREFIX }${ materialId }` } },
            ScanIndexForward: false, // updatedAt 降順
            Limit: 1,
          })
        )

        const stock = stockRes.Items?.[0]

        return {
          id: materialId,
          name: m.name.S,
          unit: m.unit.S,
          price: Number(m.price.N),
          fileName: m.fileName?.S || '',
          isValid: m.isValid?.BOOL ?? true,
          stockId: stock ? Number(stock.PK.S.replace(STOCK_PREFIX, '')) : null,
        }
      })
    )

    results.sort((a, b) => a.id - b.id)

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(results),
    }
  } catch (err) {
    console.error(err)
    await sendNotification(
      '【api/materialsエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    )
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message }),
    }
  }
}
