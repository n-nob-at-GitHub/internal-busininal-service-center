const {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
  GetItemCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const OUTBOUND_TABLE = process.env.OUTBOUND_TABLE || 'Outbound';
const STOCK_TABLE = process.env.STOCK_TABLE || 'Stock';
const DELIVERY_SITE_TABLE = process.env.DELIVERY_SITE_TABLE || 'DeliverySite';

const OUTBOUND_PREFIX = 'OUTBOUND#';
const STOCK_PREFIX = 'STOCK#';
const DELIVERY_SITE_PREFIX = 'DELIVERYSITE#';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method;
  let body = {};

  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      console.warn('Invalid JSON:', event.body);
    }
  }

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  try {
    if (method === 'GET') {
      const res = await client.send(new ScanCommand({
        TableName: OUTBOUND_TABLE,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': { S: OUTBOUND_PREFIX } },
      }));

      const items = res.Items?.map((item) => ({
        id: Number(item.PK.S.replace(OUTBOUND_PREFIX, '')),
        stockId: Number(item.stockId?.N),
        deliverySiteId: Number(item.deliverySiteId?.N),
        quantity: Number(item.quantity?.N),
        unitPrice: Number(item.unitPrice?.N),
        amount: Number(item.amount?.N),
        unit: item.unit?.S || '',
        isValid: item.isValid?.BOOL ?? true,
        createdAt: item.createdAt?.S || '',
        createdBy: item.createdBy?.S || '',
        updatedAt: item.updatedAt?.S || '',
        updatedBy: item.updatedBy?.S || '',
      })) || [];

      items.sort((a, b) => a.id - b.id);

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(items),
      };
    }

    if (method === 'PUT') {
      const data = Array.isArray(body) ? body : [ body ];
      if (!data.length) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: '更新データがありません' }),
        };
      }

      const results = [];

      for (const item of data) {
        const {
          id,
          stockId,
          deliverySiteId,
          quantity,
          unitPrice,
          isValid,
          unit,
          updatedBy,
        } = item;

        if (!id || !stockId) {
          throw new Error('id または stockId が不足しています');
        }

        const stockKey = { PK: { S: `${ STOCK_PREFIX }${ stockId }` }, SK: { S: 'DETAIL' } };
        const stockData = await client.send(
          new GetItemCommand({
            TableName: STOCK_TABLE,
            Key: stockKey
          })
        );

        if (!stockData.Item) {
          throw new Error(`Stock ${ stockId } が存在しません`);
        }

        const deliverySiteKey = { PK: { S: `${ DELIVERY_SITE_PREFIX }${ deliverySiteId }` }, SK: { S: 'DETAIL' } };
        const deliverySiteData = await client.send(
          new GetItemCommand({
            TableName: DELIVERY_SITE_TABLE,
            Key: deliverySiteKey
          })
        );

        if (!deliverySiteData.Item) {
          throw new Error(`DeliverySite ${ deliverySiteId } が存在しません`);
        }

        const currentQuantity = Number(stockData.Item.totalQuantity?.N ?? 0);
        const currentAmount = Number(stockData.Item.totalAmount?.N ?? 0);
        const deltaQuantity = isValid ? -quantity : quantity;
        const deltaAmount = isValid ? -quantity * unitPrice : quantity * unitPrice;
        const newQuantity = currentQuantity + deltaQuantity;
        const newAmount = currentAmount + deltaAmount;

        await client.send(
          new UpdateItemCommand({
            TableName: STOCK_TABLE,
            Key: stockKey,
            UpdateExpression:
              'SET totalQuantity = :q, totalAmount = :a, #u = :u, updatedAt = :ua, updatedBy = :ub',
            ExpressionAttributeNames: {
              '#u': 'unit', // unitを予約語から保護
            },
            ExpressionAttributeValues: {
              ':q': { N: newQuantity.toString() },
              ':a': { N: newAmount.toString() },
              ':u': { S: unit || '' },
              ':ua': { S: new Date().toISOString() },
              ':ub': { S: updatedBy },
            },
          })
        );

        console.log('Updating Outbound:', {
          TableName: OUTBOUND_TABLE,
          Key: { PK: `${ OUTBOUND_PREFIX }${ id }`, SK: 'DETAIL' },
          isValid,
          updatedBy,
        });

        await client.send(
          new UpdateItemCommand({
            TableName: OUTBOUND_TABLE,
            Key: { PK: { S: `${ OUTBOUND_PREFIX }${ id }` }, SK: { S: 'DETAIL' } },
            UpdateExpression:
              'SET isValid = :v, updatedAt = :ua, updatedBy = :ub',
            ExpressionAttributeValues: {
              ':v': { BOOL: isValid },
              ':ua': { S: new Date().toISOString() },
              ':ub': { S: updatedBy },
            },
          })
        );

        results.push({
          id,
          stockId,
          deliverySiteId,
          newQuantity,
          newAmount,
          isValid,
        });
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(results),
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
