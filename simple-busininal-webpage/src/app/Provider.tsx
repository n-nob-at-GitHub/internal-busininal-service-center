'use client'
import {
  createContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

interface AuthContextType {
  accessToken: string | null
}

export const AuthContext = createContext<AuthContextType>({ accessToken: null })

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
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Provider(
  { children } : { children: React.ReactNode }
) {
  const queryClient = getQueryClient()
  const [ accessToken, setAccessToken ] = useState<string | null>(null)
  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    if (!isProduction) {
      setAccessToken('local-dev-token')
      return
    }

    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', ''))
      const token = params.get('access_token')
      if (token) {
        setAccessToken(token)
        window.history.replaceState(null, '', window.location.pathname)
      }
    }

    if (!hash) {
      const domain = process.env.NEXT_PUBLIC_USER_POOL_DOMAIN
      const clientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID
      const region = process.env.NEXT_PUBLIC_USER_POOL_REGION
      const redirectUri = window.location.origin
      const url = `https://${ domain }/login?client_id=${ clientId }&response_type=token&scope=email+openid&redirect_uri=${ redirectUri }`
      window.location.href = url
    }
  }, [ isProduction ])

  return (
    <QueryClientProvider client={ queryClient }>
      <AuthContext.Provider value={{ accessToken }}>
        { children }
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}