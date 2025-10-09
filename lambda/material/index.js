const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.MATERIAL_TABLE || 'Material';
const PREFIX = 'MATERIAL#';
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
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    console.warn('Invalid JSON:', event.body);
  }


  try {
    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: CORS_HEADERS,
        body: ''
      };
    }

    if (method === 'GET' && !pathParams.id) {
      const res = await client.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': { S: PREFIX } },
      }));
      const items = res.Items?.map((i) => ({
        id: Number(i.PK.S.replace(PREFIX, '')),
        name: i.name?.S,
        unit: i.unit?.S,
        code: i.code?.S,
        description: i.description?.S,
      })) || [];
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(items)
      };
    }

    if (method === 'POST') {
      const res = await client.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': { S: PREFIX } },
        ProjectionExpression: 'PK',
      }));
      const maxId = Math.max(0, ...res.Items.map(i => Number(i.PK.S.replace(PREFIX, ''))));
      const newId = maxId + 1;

      await client.send(new PutItemCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: { S: `${ PREFIX }${ newId }` },
          SK: { S: 'DETAIL' },
          id: { N: newId.toString() },
          name: { S: body.name },
          unit: { S: body.unit },
          code: { S: body.code },
          description: { S: body.description || '' },
        },
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id: newId, ...body })
      };
    }

    if (method === 'PUT') {
      if (!body.id) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: 'id is required' })
        };
      }

      const updateExp = [];
      const expAttrValues = {};
      for (const [key, value] of Object.entries(body)) {
        if (key !== 'id') {
          updateExp.push(`#${ key } = :${ key }`);
          expAttrValues[`:${ key }`] = typeof value === 'number'
            ? { N: value.toString() }
            : { S: value };
        }
      }

      await client.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { PK: { S: `${ PREFIX }${ body.id }` }, SK: { S: 'DETAIL' } },
        UpdateExpression: `SET ${ updateExp.join(', ') }`,
        ExpressionAttributeNames: Object.fromEntries(Object.keys(body).filter(k => k !== 'id').map(k => [`#${ k }`, k])),
        ExpressionAttributeValues: expAttrValues,
      }));

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
      };
    }

    if (method === 'DELETE') {
      const { id } = pathParams;
      if (!id) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ message: 'id is required in path' })
        };
      }
      await client.send(new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: { PK: { S: `${ PREFIX }${ id }` }, SK: { S: 'DETAIL' } },
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
