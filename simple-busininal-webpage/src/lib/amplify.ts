import { Amplify } from '@aws-amplify/core'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'ap-northeast-1_ATjV25DWx',
      userPoolClientId: '4hpif7u4ej7a8vep45hsdklvae',
    }
  },
})
