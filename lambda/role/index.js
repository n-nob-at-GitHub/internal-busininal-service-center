const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { sendErrorEmail } = require('../lib/sesMailer');

const ROLE_TABLE = process.env.ROLE_TABLE;
const ROLE_PREFIX = `${ ROLE_TABLE }#`;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};
const ddbClient = new DynamoDBClient({ region: process.env.REGION });

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

exports.handler = async (event) => {
  console.log('Received event:', event);
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
      const res = await ddbClient.send(new ScanCommand({ TableName: ROLE_TABLE }));
      const roles =
        res.Items?.map((item) => ({
          id: item.PK.S?.replace(ROLE_PREFIX, ''),
          name: item.name.S,
          description: item.description.S,
        })) || [];
      roles.sort((a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
      });

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
        const PK = `${ ROLE_PREFIX }${ newId }`;

        try {
          await ddbClient.send(
            new PutItemCommand({
              TableName: ROLE_TABLE,
              Item: {
                PK: { S: PK },
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
      await ddbClient.send(
        new UpdateItemCommand({
          TableName: ROLE_TABLE,
          Key: { PK: { S: `${ ROLE_PREFIX }${id}` } },
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
      await ddbClient.send(
        new DeleteItemCommand({
          TableName: ROLE_TABLE,
          Key: { PK: { S: `${ ROLE_PREFIX }${id}` } },
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
    await sendErrorEmail(
      '【api/roleエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    );
    return { 
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
