const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.TABLE_NAME || 'Role';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Common CORS Headers.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  console.log('Received event:', event);

  // const method = event.httpMethod;
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

  // Preflight OPTIONS are also returned by Lambda.
  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }
  
  try {
    if (method === 'GET') {
      const res = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
      const roles =
        res.Items?.map((item) => ({
          id: item.PK.S?.replace('ROLE#', ''),
          name: item.name.S,
          description: item.description.S,
        })) || [];
      return { 
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(roles),
      };
    }

    if (method === 'POST') {
      const { name, description } = body;
      let newId;
      let inserted = false;
      let attempt = 0;
      const MAX_RETRY = 5;

      while (!inserted && attempt < MAX_RETRY) {
        attempt++;
        newId = generateUUID();
        const PK = `ROLE#${ newId }`;

        try {
          await client.send(
            new PutItemCommand({
              TableName: TABLE_NAME,
              Item: {
                PK: { S: PK },
                SK: { S: 'META' },
                name: { S: name },
                description: { S: description },
              },
              ConditionExpression: 'attribute_not_exists(PK)',
            })
          );
          inserted = true;
        } catch (err) {
          if (err.name === 'ConditionalCheckFailedException') {
            console.warn(`PK 重複発生、再試行 ${ attempt }`);
            continue;
          } else {
            throw err;
          }
        }
      }

      if (!inserted) {
        throw new Error('Failed to insert unique PK after multiple attempts');
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ newId, name, description }),
      };
    }

    if (method === 'PUT') {
      const { id, name, description } = body;
      await client.send(
        new UpdateItemCommand({
          TableName: TABLE_NAME,
          Key: { PK: { S: `ROLE#${id}` }, SK: { S: 'META' } },
          UpdateExpression: 'SET #name = :name, description = :desc',
          ExpressionAttributeNames: { '#name': 'name' },
          ExpressionAttributeValues: {
            ':name': { S: name },
            ':desc': { S: description },
          },
        })
      );
      return { 
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id, name, description }),
      };
    }

    if (method === 'DELETE') {
      const { id } = pathParams;
      await client.send(
        new DeleteItemCommand({
          TableName: TABLE_NAME,
          Key: { PK: { S: `ROLE#${id}` }, SK: { S: 'META' } },
        })
      );
      return { 
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id }),
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
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
