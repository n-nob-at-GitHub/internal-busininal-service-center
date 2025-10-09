const {
  DynamoDBClient,
  ScanCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.STOCK_TABLE || 'Stock';
const PREFIX = 'STOCK#';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method;
  const pathParams = event.pathParameters || {};
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
    if (method === 'GET' && !pathParams.id) {
      const res = await client.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': { S: PREFIX } },
      }));

      const items = res.Items?.map(item => ({
        id: Number(item.PK.S.replace(PREFIX, '')),
        materialId: Number(item.materialId?.N),
        totalQuantity: Number(item.totalQuantity?.N),
        totalAmount: Number(item.totalAmount?.N),
        unit: item.unit?.S || '',
        note: item.note?.S || '',
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
