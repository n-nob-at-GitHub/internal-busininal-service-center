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

async function getNextStockId() {
  const scanParams = {
    TableName: STOCK_TABLE,
    ProjectionExpression: 'PK',
    FilterExpression: 'begins_with(PK, :p)',
    ExpressionAttributeValues: {
      ':p': { S: STOCK_PREFIX },
    },
  }

  const res = await ddbClient.send(new ScanCommand(scanParams))
  const items = res.Items || []
  let max = 0
  for (const it of items) {
    const pk = unmarshall(it).PK
    const num = Number(String(pk).replace(STOCK_PREFIX, ''))
    if (!Number.isNaN(num) && num > max) max = num
  }
  return max + 1
}

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
    let nextStockId = await getNextStockId()

    for (const it of items) {
      const materialId = it.materialId
      const existingStock = await findExistingStock(materialId)
      const unit = it.unit ?? ''
      const quantity = Number(it.quantity ?? 0)
      const unitPrice = Number(it.unitPrice ?? 0)
      const updatedBy = it.updatedBy ?? 'system'
      const now = new Date().toISOString()

      if (existingStock) {
        const key = { PK: existingStock.PK, SK: existingStock.SK }
        const getRes = await ddbClient.send(new GetItemCommand({
          TableName: STOCK_TABLE,
          Key: marshall(key),
        }))

        if (!getRes.Item) {
          throw new Error(`materialId ${ materialId } の在庫が存在しません`)
        }

        const stockObj = unmarshall(getRes.Item)
        const currentQuantity = Number(stockObj.totalQuantity ?? 0)
        const currentAmount = Number(stockObj.totalAmount ?? 0)

        const newQuantity = currentQuantity + quantity
        const newAmount = currentAmount + quantity * unitPrice

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
          })
        }

        await ddbClient.send(new UpdateItemCommand(updateParams))

        results.push({
          id: Number(existingStock.PK.replace(STOCK_PREFIX, '')),
          materialId,
          totalQuantity: newQuantity,
          totalAmount: newAmount,
        })
      } else {
        const newId = nextStockId++
        const key = { PK: `${ STOCK_PREFIX }${ newId }`, SK: 'DETAIL' }
        const item = {
          PK: key.PK,
          SK: key.SK,
          materialId: materialId,
          totalQuantity: quantity,
          totalAmount: quantity * unitPrice,
          unit,
          note: it.note ?? '',
          createdAt: it.createdAt ?? now,
          createdBy: it.createdBy ?? updatedBy,
          updatedAt: it.updatedAt ?? now,
          updatedBy,
        }
        const putParams = {
          TableName: STOCK_TABLE,
          Item: marshall(item, { removeUndefinedValues: true }),
        }
        await ddbClient.send(new PutItemCommand(putParams))

        results.push({
          id: newId,
          materialId,
          totalQuantity: item.totalQuantity,
          totalAmount: item.totalAmount,
        })
      }
    }
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(results),
    }
  } catch (err) {
    console.error(err)
    await sendNotification(
      '【api/inbound-stocksエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    )
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message || 'Internal error' }),
    }
  }
}
