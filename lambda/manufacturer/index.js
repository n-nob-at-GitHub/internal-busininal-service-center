const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.MANUFACTURER_TABLE || 'Manufacturer';

// UUID 生成
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Common CORS Headers.
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
    } catch (err) {
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
      const res = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
      const items = res.Items?.map(item => ({
        id: item.PK.S?.replace('MANUFACTURER#', ''),
        name: item.name.S,
      })) || [];
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(items)
      };
    }

    if (method === 'POST') {
      const { name } = body;
      if (!name) throw new Error('name 必須');

      let newId, inserted = false, attempt = 0;
      const MAX_RETRY = 5;

      while (!inserted && attempt < MAX_RETRY) {
        attempt++;
        newId = generateUUID();
        const PK = `MANUFACTURER#${newId}`;
        try {
          await client.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: { PK: { S: PK }, name: { S: name } },
            ConditionExpression: 'attribute_not_exists(PK)',
          }));
          inserted = true;
        } catch (err) {
          if (err.name === 'ConditionalCheckFailedException') continue;
          else throw err;
        }
      }
      if (!inserted) throw new Error('Failed to insert unique PK after multiple attempts');

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id: newId, name })
      };
    }

    if (method === 'PUT') {
      const { id, name } = body;
      if (!id || !name) throw new Error('id と name が必須です');

      await client.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { PK: { S: `MANUFACTURER#${id}` } },
        UpdateExpression: 'SET #name = :name',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: { ':name': { S: name } },
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id, name })
      };
    }

    if (method === 'DELETE') {
      const id = pathParams.id || event.path.split('/').pop();
      if (!id) throw new Error('id 必須');

      await client.send(new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: { PK: { S: `MANUFACTURER#${id}` } },
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id })
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message })
    };
  }
};
