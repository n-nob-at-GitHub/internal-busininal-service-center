const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb')
const { sendNotification } = require('./lib/snsNotifier')

const MANUFACTURER_TABLE = process.env.MANUFACTURER_TABLE
const MANUFACTURER_PREFIX = `${ MANUFACTURER_TABLE.toUpperCase() }#`
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
    } catch (err) {
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
    if (method === 'GET') {
      const res = await ddbClient.send(new ScanCommand({ TableName: MANUFACTURER_TABLE }))
      const manufacturers = res.Items?.map(item => ({
        id: Number(item.PK.S?.replace(MANUFACTURER_PREFIX, '')),
        name: item.name.S,
      })) || []

      manufacturers.sort((a, b) => a.id - b.id)

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(manufacturers)
      }
    }

    if (method === 'POST') {
      const { name } = body
      if (!name) throw new Error('製造メーカー名は必須です')

      const res = await ddbClient.send(new ScanCommand({ TableName: MANUFACTURER_TABLE }))
      const existingIds = res.Items?.map(item => Number(item.PK.S?.replace(MANUFACTURER_PREFIX, ''))) || []
      const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1

      const PK = `${ MANUFACTURER_PREFIX }${ newId }`

      await ddbClient.send(
        new PutItemCommand({
          TableName: MANUFACTURER_TABLE,
          Item: {
            PK: { S: PK },
            name: { S: name },
          },
          ConditionExpression: 'attribute_not_exists(PK)',
        })
      )

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id: newId, name })
      }
    }

    if (method === 'PUT') {
      const { id, name } = body
      if (!id) throw new Error('id 必須')
      if (!name) throw new Error('製造メーカー名は必須です')

      await ddbClient.send(
        new UpdateItemCommand({
          TableName: MANUFACTURER_TABLE,
          Key: { PK: { S: `${ MANUFACTURER_PREFIX }${ id }` } },
          UpdateExpression: 'SET #name = :name',
          ExpressionAttributeNames: { '#name': 'name' },
          ExpressionAttributeValues: { ':name': { S: name } },
        })
      )

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id, name })
      }
    }

    if (method === 'DELETE') {
      const { id } = pathParams
      if (!id) throw new Error('id 必須')

      await ddbClient.send(
        new DeleteItemCommand({
          TableName: MANUFACTURER_TABLE,
          Key: { PK: { S: `${ MANUFACTURER_PREFIX }${ id }` } },
        })
      )

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id })
      }
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  } catch (err) {
    console.error(err)
    await sendNotification(
      '【api/manufacturerエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    )
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message })
    }
  }
}
