const {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const {
  DynamoDBClient,
  GetItemCommand
} = require('@aws-sdk/client-dynamodb');

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const USER_POOL_ID = process.env.USER_POOL_ID || 'ap-northeast-1_ATjV25DWx';
const ROLE_TABLE = process.env.ROLE_TABLE || 'Role';

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
    } catch {
      body = {};
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
      const listUsersRes = await cognitoClient.send(new ListUsersCommand({ UserPoolId: USER_POOL_ID }));
      const users = await Promise.all(
        listUsersRes.Users.map(async (u) => 
          {
            const sub = u.Attributes.find(a => a.Name === 'sub')?.Value || '';
            const email = u.Attributes.find(a => a.Name === 'email')?.Value || '';
            const roleId = u.Attributes.find(a => a.Name === 'custom:role')?.Value || '';

            let roleName = '';
            if (roleId) {
              const roleRes = await ddbClient.send(new GetItemCommand({
                TableName: ROLE_TABLE,
                Key: { PK: { S: `ROLE#${ roleId }` } }
              }));
              roleName = roleRes.Item?.name?.S || '';
            }

            return {
              id: sub,
              mail: email,
              roleId,
              roleName
            };
          })
        );
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(users)
      };
    }

    if (method === 'POST') {
      const { mail, roleId } = body;
      if (!mail) throw new Error('メール必須');
      if (!roleId) throw new Error('roleId 必須');

      const createRes = await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: mail,
        UserAttributes: [
          { Name: 'email', Value: mail },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'custom:role', Value: roleId },
        ],
        MessageAction: 'SUPPRESS',
      }));
      const sub = createRes.User.Attributes.find(a => a.Name === 'sub')?.Value;
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id: sub, mail, roleId })
      };
    }

    if (method === 'PUT') {
      const { id, mail, roleId } = body;
      if (!id) throw new Error('id 必須');

      const attrs = [];
      if (mail) attrs.push({ Name: 'email', Value: mail });
      if (roleId) attrs.push({ Name: 'custom:role', Value: roleId });

      await cognitoClient.send(new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: id,
        UserAttributes: attrs,
      }));
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id, mail, roleId })
      };
    }

    if (method === 'DELETE') {
      const { id } = pathParams;
      if (!id) throw new Error('id 必須');
      await cognitoClient.send(new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: id }));
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
