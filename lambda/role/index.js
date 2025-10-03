import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';

const client = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.TABLE_NAME || 'Role';

export const handler = async (event) => {
  console.log('Received event:', event);

  const method = event.httpMethod;
  const pathParams = event.pathParameters || {};
  let body = {};
  if (event.body) body = JSON.parse(event.body);

  try {
    if (method === 'GET') {
      const res = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
      const roles =
        res.Items?.map((item) => ({
          id: item.PK.S?.replace('ROLE#', ''),
          name: item.name.S,
          description: item.description.S,
        })) || [];
      return { statusCode: 200, body: JSON.stringify(roles) };
    }

    if (method === 'POST') {
      const { id, name, description } = body;
      await client.send(
        new PutItemCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: { S: `ROLE#${id}` },
            SK: { S: 'META' },
            name: { S: name },
            description: { S: description },
          },
        })
      );
      return {
        statusCode: 200,
        body: JSON.stringify({ id, name, description }),
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
      return { statusCode: 200, body: JSON.stringify({ id }) };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify(err) };
  }
};
