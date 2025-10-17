const {
  DynamoDBClient,
  ScanCommand,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb')
const {
  marshall,
  unmarshall
} = require('@aws-sdk/util-dynamodb')
const { sendNotification } = require('./lib/snsNotifier')

const STOCK_TABLE = process.env.STOCK_TABLE
const STOCK_PREFIX = `${ STOCK_TABLE.toUpperCase() }#`
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
}
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })

const findExistingStock = async (materialId) => {
  const scanParams = {
    TableName: STOCK_TABLE,
    FilterExpression: 'materialId = :m',
    ExpressionAttributeValues: { ':m': { S: materialId } },
  }
  const res = await ddbClient.send(new ScanCommand(scanParams))
  const items = res.Items || []
  return items.length > 0 ? unmarshall(items[0]) : null
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

  if (method !== 'PUT') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  const items = Array.isArray(body) ? body : (body ? [ body ] : [])
  if (items.length === 0) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: '更新データがありません' }),
    }
  }

  try {
    const results = []
    for (const it of items) {
      const materialId = it.materialId
      const existingStock = await findExistingStock(materialId)
      const unit = it.unit ?? ''
      const quantity = Number(it.quantity ?? 0)
      const unitPrice = Number(it.unitPrice ?? 0)
      const updatedBy = it.updatedBy ?? 'system'
      const now = new Date().toISOString()

      if (!existingStock) {
        throw new Error(`在庫が存在しません（materialId: ${ materialId }）`)
      }

      const currentQuantity = Number(existingStock.totalQuantity ?? 0)
      const currentAmount = Number(existingStock.totalAmount ?? 0)

      const newQuantity = currentQuantity - quantity
      const newAmount = currentAmount - quantity * unitPrice

      if (currentQuantity < quantity) {
        throw new Error(`在庫不足です（materialId: ${ materialId }）`)
      }

      const key = { PK: existingStock.PK, SK: existingStock.SK }
      const updateParams = {
        TableName: STOCK_TABLE,
        Key: marshall(key),
        UpdateExpression: 'SET totalQuantity = :q, totalAmount = :a, #u = :u, updatedAt = :ua, updatedBy = :ub, materialId = :mid',
        ExpressionAttributeNames: {
          '#u': 'unit',
        },
        ExpressionAttributeValues: marshall({
          ':q': newQuantity,
          ':a': newAmount,
          ':u': unit,
          ':ua': now,
          ':ub': updatedBy,
          ':mid': materialId,
        }),
      }

      await ddbClient.send(new UpdateItemCommand(updateParams))

      results.push({
        id: existingStock.PK.replace(STOCK_PREFIX, ''),
        materialId,
        totalQuantity: newQuantity,
        totalAmount: newAmount,
      })
    }
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(results),
    }
  } catch (err) {
    console.error(err)
    await sendNotification(
      '【api/outbound-stocksエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    )
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message || 'Internal error' }),
    }
  }
}
