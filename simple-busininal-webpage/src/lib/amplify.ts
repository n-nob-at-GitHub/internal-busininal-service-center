'use client'
import { Amplify } from 'aws-amplify'

console.log('NEXT_PUBLIC_COGNITO_USER_POOL_ID:', process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID)
console.log('NEXT_PUBLIC_REDIRECT_URI:',         process.env.NEXT_PUBLIC_REDIRECT_URI)
console.log('NEXT_PUBLIC_USER_POOL_CLIENT_ID:',  process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID)
console.log('NEXT_PUBLIC_USER_POOL_DOMAIN:',     process.env.NEXT_PUBLIC_USER_POOL_DOMAIN)
console.log('NEXT_PUBLIC_USER_POOL_REGION:',     process.env.NEXT_PUBLIC_USER_POOL_REGION)

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_USER_POOL_DOMAIN!,
          scopes: [ 'openid', 'email' ],
          redirectSignIn: [ process.env.NEXT_PUBLIC_REDIRECT_URI! ],
          redirectSignOut: [ process.env.NEXT_PUBLIC_REDIRECT_URI! ],
          responseType: 'token',
        },
      },
    },
  },
})
