const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.DELIVERY_SITE_TABLE || 'DeliverySite';

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
      const res = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
      const sites = res.Items?.map(item => ({
        id: Number(item.PK.S.replace('DELIVERYSITE#', '')),
        name: item.name.S,
        code: item.code?.S || '',
        contact: item.contact?.S || '',
      })) || [];
      sites.sort((a, b) => a.id - b.id);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(sites)
      };
    }

    if (method === 'POST') {
      const { name, code, contact } = body;
      if (!name) throw new Error('配送先名は必須です');

      const res = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
      const existingIds = res.Items?.map(item => Number(item.PK.S.replace('DELIVERYSITE#', ''))) || [];
      const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

      const PK = `DELIVERYSITE#${newId}`;
      await client.send(new PutItemCommand({
        TableName: TABLE_NAME,
        Item: { PK: { S: PK }, name: { S: name }, code: { S: code || '' }, contact: { S: contact || '' } },
        ConditionExpression: 'attribute_not_exists(PK)',
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id: newId, name, code, contact })
      };
    }

    if (method === 'PUT') {
      const { id, name, code, contact } = body;
      if (!id || !name) throw new Error('id と配送先名は必須です');

      await client.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { PK: { S: `DELIVERYSITE#${id}` } },
        UpdateExpression: 'SET #name = :name, #code = :code, #contact = :contact',
        ExpressionAttributeNames: { '#name': 'name', '#code': 'code', '#contact': 'contact' },
        ExpressionAttributeValues: { ':name': { S: name }, ':code': { S: code || '' }, ':contact': { S: contact || '' } },
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id, name, code, contact })
      };
    }

    if (method === 'DELETE') {
      const { id } = pathParams;
      if (!id) throw new Error('id 必須');

      await client.send(new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: { PK: { S: `DELIVERYSITE#${id}` } },
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
