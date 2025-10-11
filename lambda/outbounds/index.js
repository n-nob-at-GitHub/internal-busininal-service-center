const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
} = require('@aws-sdk/client-dynamodb');
const {
  marshall,
  unmarshall
} = require('@aws-sdk/util-dynamodb');

const REGION = process.env.AWS_REGION || 'ap-northeast-1';
const OUTBOUND_TABLE = process.env.OUTBOUND_TABLE || 'Outbound';
const OUTBOUND_PREFIX = 'OUTBOUND#';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

const client = new DynamoDBClient({ region: REGION });

async function getNextOutboundId() {
  const scanParams = {
    TableName: OUTBOUND_TABLE,
    ProjectionExpression: 'PK',
    FilterExpression: 'begins_with(PK, :p)',
    ExpressionAttributeValues: {
      ':p': { S: OUTBOUND_PREFIX },
    },
  };

  const res = await client.send(new ScanCommand(scanParams));
  const items = res.Items || [];
  let max = 0;
  for (const it of items) {
    const obj = unmarshall(it);
    if (!obj.PK) continue;
    const pk = obj.PK;
    const num = Number(String(pk).replace(OUTBOUND_PREFIX, ''));
    if (!Number.isNaN(num) && num > max) max = num;
  }
  return max + 1;
}

exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method;
  let body = null;

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

  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  if (!body || !Array.isArray(body) || body.length === 0) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: '登録データがありません' }),
    };
  }

  try {
    const created = [];
    let nextId = await getNextOutboundId();

    for (const entry of body) {
      const id = nextId++;
      const now = new Date().toISOString();

      const item = {
        PK: `OUTBOUND#${ id }`,
        SK: 'DETAIL',
        stockId: entry.stockId ?? null,
        deliverySiteId: entry.deliverySiteId ?? '',
        quantity: entry.quantity ?? 0,
        unitPrice: entry.unitPrice ?? entry.price ?? 0,
        amount: entry.amount ?? ((entry.quantity ?? 0) * (entry.unitPrice ?? entry.price ?? 0)),
        unit: entry.unit ?? '',
        isValid: entry.isValid === undefined ? true : !!entry.isValid,
        createdAt: entry.createdAt ?? now,
        createdBy: entry.createdBy ?? entry.updatedBy ?? 'system',
        updatedAt: entry.updatedAt ?? now,
        updatedBy: entry.updatedBy ?? entry.createdBy ?? 'system',
        note: entry.note ?? '',
      };

      const putParams = {
        TableName: OUTBOUND_TABLE,
        Item: marshall(item, { removeUndefinedValues: true }),
      };

      await client.send(new PutItemCommand(putParams));

      created.push({
        id,
        stockId: item.stockId,
        deliverySiteId: item.deliverySiteId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        unit: item.unit,
        isValid: item.isValid,
        createdAt: item.createdAt,
        createdBy: item.createdBy,
      });
    }

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify(created),
    };

  } catch (err) {
    console.error('Error inserting outbound item:', err, { entry: body });
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message || 'Internal error' }),
    };
  }
};
