import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DELIVERY_SITE_TABLE || 'Material';
const PREFIX = 'MATERIAL#';

export const handler = async (event) => {
  const method = event.httpMethod;
  const headers = {
    'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };

  try {
    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: CORS_HEADERS,
        body: ''
      };
    }

    if (method === 'GET' && event.path === '/material') {
      const res = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': PREFIX },
      }));
      const items = res.Items?.map(i => ({
        id: Number(i.PK.replace(PREFIX, '')),
        ...i,
      }));
      return {
        statusCode: 200,
        headers, body:
        JSON.stringify(items)
      };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body);
      const res = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :p)',
        ExpressionAttributeValues: { ':p': PREFIX },
        ProjectionExpression: 'PK',
      }));
      const maxId = Math.max(0, ...res.Items.map(i => Number(i.PK.replace(PREFIX, ''))));
      const newId = maxId + 1;

      const newItem = {
        PK: `${PREFIX}${newId}`,
        SK: 'DETAIL',
        id: newId,
        ...body,
      };
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: newItem,
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(newItem)
      };
    }

    if (method === 'PUT') {
      const body = JSON.parse(event.body);
      if (!body.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'id is required' })
        };
      }

      const updateExp = [];
      const expAttrValues = {};
      for (const [key, value] of Object.entries(body)) {
        if (key !== 'id') {
          updateExp.push(`#${ key } = :${ key }`);
          expAttrValues[`:${ key }`] = value;
        }
      }

      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `${ PREFIX }${ body.id }`, SK: 'DETAIL' },
        UpdateExpression: `SET ${ updateExp.join(', ') }`,
        ExpressionAttributeNames: Object.fromEntries(Object.keys(body).filter(k => k !== 'id').map(k => [`#${ k }`, k])),
        ExpressionAttributeValues: expAttrValues,
      }));

      return {
        statusCode: 200,
        headers, body:
        JSON.stringify(body)
      };
    }

    if (method === 'DELETE' && event.pathParameters?.id) {
      const id = Number(event.pathParameters.id);
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: `${ PREFIX }${ id }`, SK: 'DETAIL' },
      }));
      return {
        statusCode: 200,
        headers, body:
        JSON.stringify({ id })
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
