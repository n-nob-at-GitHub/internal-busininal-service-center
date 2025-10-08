'use client'
import {
  createContext,
  ReactNode,
} from 'react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { AuthProvider, useAuth } from 'react-oidc-context'
import { UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts'

const isProduction = process.env.NODE_ENV === 'production'

const oidcConfig: UserManagerSettings  = {
  authority: `https://${ process.env.NEXT_PUBLIC_USER_POOL_DOMAIN }`,
  client_id: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
  redirect_uri: typeof window !== 'undefined' ? `${ window.location.origin }/` : '',
  post_logout_redirect_uri: typeof window !== 'undefined' ? `${ window.location.origin }/` : '',
  response_type: 'code',
  scope: 'openid email profile',
  automaticSilentRenew: true,
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export const AuthContext = createContext<{ accessToken: string | null }>({
  accessToken: null,
})

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const accessToken = auth.user?.access_token ?? null

  if (auth.isLoading) {
    return <div>Loading authentication...</div>
  }

  if (auth.error) {
    return (
      <div>
        Authentication error: { auth.error.message }
        <button onClick={ () => auth.signinRedirect() }>Retry</button>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    if (!isProduction) {
      return (
        <AuthContext.Provider value={{ accessToken: 'local-dev-token' }}>
          { children }
        </AuthContext.Provider>
      )
    }

    auth.signinRedirect()
    return <div>Redirecting to login...</div>
  }

  return (
    <AuthContext.Provider value={{ accessToken }}>
      { children }
    </AuthContext.Provider>
  )
}

export default function Provider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={ queryClient }>
      <AuthProvider { ...oidcConfig }>
        <AuthWrapper>{ children }</AuthWrapper>
      </AuthProvider>
    </QueryClientProvider>
  )
}
