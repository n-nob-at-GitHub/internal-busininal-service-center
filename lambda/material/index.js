const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb')
const { sendNotification } = require('./lib/snsNotifier')

const MATERIAL_TABLE = process.env.MATERIAL_TABLE
const MATERIAL_PREFIX = `${ MATERIAL_TABLE.toUpperCase() }#`
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
  try {
    body = event.body ? JSON.parse(event.body) : {}
  } catch {
    console.warn('Invalid JSON:', event.body)
  }

  try {
    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: CORS_HEADERS,
        body: ''
      }
    }

    if (method === 'GET' && !pathParams.id) {
      const res = await ddbClient.send(new ScanCommand({
        TableName: MATERIAL_TABLE,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': { S: MATERIAL_PREFIX } },
      }))
      const items = res.Items?.map((i) => ({
        id: Number(i.PK.S.replace(MATERIAL_PREFIX, '')),
        manufacturerId: i.manufacturerId?.N ? Number(i.manufacturerId.N) : null,
        code: i.code?.S,
        category: i.category?.S,
        price: i.price?.N ? Number(i.price.N) : null,
        quantity: i.quantity?.N ? Number(i.quantity.N) : null,
        unit: i.unit?.S,
        name: i.name?.S,
        fileName: i.fileName?.S || '',
        isValid: i.isValid?.BOOL ?? true,
      })) || []
      items.sort((a, b) => a.id - b.id)
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(items)
      }
    }

    if (method === 'POST') {
      const res = await ddbClient.send(new ScanCommand({
        TableName: MATERIAL_TABLE,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': { S: MATERIAL_PREFIX } },
        ProjectionExpression: 'PK',
      }))
      const maxId = Math.max(0, ...res.Items.map(i => Number(i.PK.S.replace(MATERIAL_PREFIX, ''))))
      const newId = maxId + 1

      const newItem = {
        PK: { S: `${ MATERIAL_PREFIX }${ newId }` },
        SK: { S: 'DETAIL' },
        manufacturerId: { N: body.manufacturerId?.toString() || '0' },
        code: { S: body.code || '' },
        category: { S: body.category || '' },
        price: { N: body.price?.toString() || '0' },
        quantity: { N: body.quantity?.toString() || '0' },
        unit: { S: body.unit || '' },
        name: { S: body.name || '' },
        fileName: { S: body.fileName || '' },
        isValid: { BOOL: body.isValid !== undefined ? body.isValid : true },
      }

      await ddbClient.send(new PutItemCommand({ TableName: MATERIAL_TABLE, Item: newItem }))

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id: newId, ...body })
      }
    }

    if (method === 'PUT') {
      if (!body.id) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: 'id is required' })
        }
      }

      const updateExp = []
      const expAttrValues = {}
      for (const [ key, value ] of Object.entries(body)) {
        if (key !== 'id') {
          updateExp.push(`#${ key } = :${ key }`)
          if (typeof value === 'number') { 
            expAttrValues[`:${ key }`] = { N: value.toString() }
          } else if (typeof value === 'boolean') {
            expAttrValues[`:${ key }`] = { BOOL: value }
          } else {
            expAttrValues[`:${ key }`] = { S: value }
          }
        }
      }

      await ddbClient.send(new UpdateItemCommand({
        TableName: MATERIAL_TABLE,
        Key: { PK: { S: `${ MATERIAL_PREFIX }${ body.id }` }, SK: { S: 'DETAIL' } },
        UpdateExpression: `SET ${ updateExp.join(', ') }`,
        ExpressionAttributeNames: Object.fromEntries(Object.keys(body).filter(k => k !== 'id').map(k => [`#${ k }`, k])),
        ExpressionAttributeValues: expAttrValues,
      }))

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
      }
    }

    if (method === 'DELETE') {
      const { id } = pathParams
      if (!id) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: 'id is required in path' })
        }
      }
      await ddbClient.send(new DeleteItemCommand({
        TableName: MATERIAL_TABLE,
        Key: { PK: { S: `${ MATERIAL_PREFIX }${ id }` }, SK: { S: 'DETAIL' } },
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
      '【api/materialエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    )
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message })
    }
  }
}
