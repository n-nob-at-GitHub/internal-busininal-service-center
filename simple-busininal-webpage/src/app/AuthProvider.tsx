'use client'

import React, { createContext, ReactNode } from 'react'
import { AuthProvider as OidcAuthProvider, useAuth } from 'react-oidc-context'
import { UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts'

const isProduction = process.env.NODE_ENV === 'production'

const oidcConfig: UserManagerSettings = {
  metadata: {
    issuer: `https://${ process.env.NEXT_PUBLIC_USER_POOL_DOMAIN }/`,
    authorization_endpoint: `https://${ process.env.NEXT_PUBLIC_USER_POOL_DOMAIN }/login`,
    token_endpoint: `https://${ process.env.NEXT_PUBLIC_USER_POOL_DOMAIN }/oauth2/token`,
    userinfo_endpoint: `https://${ process.env.NEXT_PUBLIC_USER_POOL_DOMAIN }/oauth2/userInfo`,
    end_session_endpoint: `https://${ process.env.NEXT_PUBLIC_USER_POOL_DOMAIN }/logout`,
  },
  authority: `https://${ process.env.NEXT_PUBLIC_USER_POOL_DOMAIN }`,
  client_id: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
  redirect_uri: typeof window !== 'undefined' ? `${ window.location.origin }/` : '',
  post_logout_redirect_uri: typeof window !== 'undefined' ? `${ window.location.origin }/` : '',
  response_type: 'code',
  scope: 'openid email profile',
  automaticSilentRenew: true,
  loadUserInfo: true,
  userStore:
    typeof window !== 'undefined' ? new WebStorageStateStore({ store: window.localStorage }) : undefined,
}

export const AuthContext = createContext<{ accessToken: string | null }>({ accessToken: null })

function AuthWrapper({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const accessToken = auth.user?.access_token ?? null

  if (auth.isLoading) return <div>Loading authentication...</div>

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
      return <AuthContext.Provider value={{ accessToken: 'local-dev-token' }}>{children}</AuthContext.Provider>
    }

    auth.signinRedirect()
    return <div>Redirecting to login...</div>
  }

  return <AuthContext.Provider value={{ accessToken }}>{children}</AuthContext.Provider>
}

export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <OidcAuthProvider { ...oidcConfig }>
      <AuthWrapper>
        { children }
      </AuthWrapper>
    </OidcAuthProvider>
  )
}
