const {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider')
const {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
} = require('@aws-sdk/client-dynamodb')
const { sendNotification } = require('./lib/snsNotifier')

const USER_POOL_ID = process.env.USER_POOL_ID
const ROLE_TABLE = process.env.ROLE_TABLE
const ROLE_PREFIX = `${ ROLE_TABLE.toUpperCase() }#`
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://d2slubzovll4xp.cloudfront.net',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
}

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION })
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION })

exports.handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method
  const pathParams = event.pathParameters || {}
  let body = {}
  if (event.body) {
    try {
      body = JSON.parse(event.body)
    } catch {
      body = {}
    }
  }

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    }
  }

  try {
    if (method === 'GET') {
      const listUsersRes = await cognitoClient.send(new ListUsersCommand({ UserPoolId: USER_POOL_ID }))
      const users = listUsersRes.Users.map(u => {
        const sub = u.Attributes.find(a => a.Name === 'sub')?.Value || ''
        const email = u.Attributes.find(a => a.Name === 'email')?.Value || ''
        const name = u.Attributes.find(a => a.Name === 'name')?.Value || ''
        const role = u.Attributes.find(a => a.Name === 'custom:role')?.Value || ''
        let jsonRole = JSON.parse(role)
        return {
          id: sub,
          mail: email,
          name,
          role: jsonRole,
          // Although it's quite awkward, I added it to display the role name at the front end, based on the roleId.
          roleId: jsonRole.id,
        }
      })
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(users)
      }
    }

    if (method === 'POST') {
      const { mail, role } = body
      const roleId = role?.id
      if (!mail) throw new Error('メール必須')
      if (!roleId) throw new Error('roleId 必須')

      const roleRes = await ddbClient.send(new GetItemCommand({
        TableName: ROLE_TABLE,
        Key: { PK: { S: `${ ROLE_PREFIX }${ roleId }` } }
      }))
      const roleName = roleRes.Item?.name?.S
      if (!roleName) throw new Error('無効なロールです')

      const createRes = await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: mail,
        TemporaryPassword: 'InitPass123!',
        UserAttributes: [
          { Name: 'email', Value: mail },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'name', Value: body.name || '' },
          { Name: 'custom:role', Value: JSON.stringify({ id: roleId, name: roleName })  },
        ],
        MessageAction: 'SUPPRESS',
      }))
      const sub = createRes.User.Attributes.find(a => a.Name === 'sub')?.Value
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          id: sub, 
          mail, 
          role: JSON.stringify({ id: roleId, name: roleName }),
          roleId
        })
      }
      
    }

    if (method === 'PUT') {
      const { id, mail, role } = body
      const roleId = role?.id
      if (!mail) throw new Error('メール必須')
      if (!roleId) throw new Error('roleId 必須')
      const attrs = []
      if (mail) {
        attrs.push({ Name: 'email', Value: mail })
      }
      const roleRes = await ddbClient.send(new GetItemCommand({
        TableName: ROLE_TABLE,
        Key: { PK: { S: `${ ROLE_PREFIX }${ roleId }` } }
      }))
      const roleName = roleRes.Item?.name?.S
      if (!roleName) throw new Error('無効なロールです')
      attrs.push({
        Name: 'custom:role',
        Value: JSON.stringify({ id: roleId, name: roleName }) 
      })
      if (body.name) {
        attrs.push({ Name: 'name', Value: body.name })
      }

      await cognitoClient.send(new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: id,
        UserAttributes: attrs,
      }))
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          id,
          mail,
          role: JSON.stringify({ id: roleId, name: roleName }),
          roleId
        })
      }
    }

    if (method === 'DELETE') {
      const { id } = pathParams
      await cognitoClient.send(new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: id }))
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ id })
      }
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method not allowed' })
    }
  } catch (err) {
    console.error(err)
    await sendNotification(
      '【api/userエラー通知】',
      `エラー内容: ${ err.message }\n\nスタックトレース:\n${ err.stack }\n\n入力データ:\n${ JSON.stringify(body, null, 2) }`
    )
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err.message })
    }
  }
}
