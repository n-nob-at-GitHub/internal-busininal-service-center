const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb')
const { sendNotification } = require('./lib/snsNotifier')

const DELIVERY_SITE_TABLE = process.env.DELIVERY_SITE_TABLE
const DELIVERY_SITE_PREFIX = `${ DELIVERY_SITE_TABLE.toUpperCase() }#`
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
      const res = await ddbClient.send(new ScanCommand({ TableName: DELIVERY_SITE_TABLE }))
      const sites = res.Items?.map(item => ({
        id: Number(item.PK.S.replace(DELIVERY_SITE_PREFIX, '')),
        name: item.name.S,
        code: item.code?.S || '',
        contact: item.contact?.S || '',
      })) || []
      sites.sort((a, b) => a.id - b.id)
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(sites)
      }
    }

    if (method === 'POST') {
      const { name, code, contact } = body
      if (!name) throw new Error('配送先名は必須です')

      const res = await ddbClient.send(new ScanCommand({ TableName: DELIVERY_SITE_TABLE }))
      const existingIds = res.Items?.map(item => Number(item.PK.S.replace(DELIVERY_SITE_PREFIX, ''))) || []
      const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1

      const PK = `${ DELIVERY_SITE_PREFIX }${ newId }`
      await ddbClient.send(new PutItemCommand({
        TableName: DELIVERY_SITE_TABLE,
        Item: { PK: { S: PK }, name: { S: name }, code: { S: code || '' }, contact: { S: contact || '' } },
        ConditionExpression: 'attribute_not_exists(PK)',
      }))

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id: newId, name, code, contact })
      }
    }

    if (method === 'PUT') {
      const { id, name, code, contact } = body
      if (!id || !name) throw new Error('id と配送先名は必須です')

      await ddbClient.send(new UpdateItemCommand({
        TableName: DELIVERY_SITE_TABLE,
        Key: { PK: { S: `${ DELIVERY_SITE_PREFIX }${id}` } },
        UpdateExpression: 'SET #name = :name, #code = :code, #contact = :contact',
        ExpressionAttributeNames: { '#name': 'name', '#code': 'code', '#contact': 'contact' },
        ExpressionAttributeValues: { ':name': { S: name }, ':code': { S: code || '' }, ':contact': { S: contact || '' } },
      }))

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id, name, code, contact })
      }
    }

    if (method === 'DELETE') {
      const { id } = pathParams
      if (!id) throw new Error('id 必須')

      await ddbClient.send(new DeleteItemCommand({
        TableName: DELIVERY_SITE_TABLE,
        Key: { PK: { S: `${ DELIVERY_SITE_PREFIX }${ id }` } },
      }))

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
      '【api/delivery-siteエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    )
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message })
    }
  }
}
