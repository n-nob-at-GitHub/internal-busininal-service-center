'use client'
import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from 'react-oidc-context'

interface DecodedIdToken {
  'cognito:username'?: string
  name?: string
  email?: string
  'custom:role'?: string
  [ key: string ]: any
}

export function useUser() {
  const auth = useAuth()
  const [ user, setUser ] = useState<{ name: string, role: string } | null>(null)
  
  useEffect(() => {
    if (auth.isLoading) return
    if (process.env.NODE_ENV === 'development') {
      setUser({ name: 'dev-user', role: 'SYSTEM' })
      return
    }
    if (auth.error) {
      console.error('Auth error:', auth.error)
      setUser(null)
      return
    }
    if (auth.user?.id_token) {
      try {
        const decoded = jwtDecode<DecodedIdToken>(auth.user.id_token)
        const username =
          decoded.name ||
          decoded.email ||
          decoded['cognito:username'] ||
          'unknown'
        const userrole = decoded['custom:role'] || 'STAFF'

        setUser({ name: username, role: userrole })
      } catch (error) {
        console.error('Failed to decode id_token:', error)
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [ auth ])

  return user
}
