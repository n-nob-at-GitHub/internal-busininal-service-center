'use client'
import { useState, useEffect } from 'react'
import { useAuth } from 'react-oidc-context'
import { jwtDecode } from 'jwt-decode'

interface UserInfo {
  name: string
  role: {
    id: string,
    name: string,
  }
}

interface DecodedIdToken {
  'cognito:username'?: string
  name?: string
  email?: string
  'custom:role'?: string
  [ key: string ]: any
}

export function useUser() {
  const auth = useAuth()
  const [ user, setUser ] = useState<UserInfo | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setUser({ name: 'dev-user', role: { id: '1', name: 'SYSTEM' } })
      return
    }

    if (!auth || auth.isLoading) return

    if (auth.error) {
      console.error('Auth error:', auth.error)
      setUser(null)
      return
    }

    if (auth.isAuthenticated) {
      let username = 'unknown'
      let userrole = { id: '3', name: 'STAFF' }

      if (auth.user?.profile) {
        username = String(auth.user.profile.name || auth.user.profile.email || auth.user.profile['cognito:username'] || 'unknown')
        if (auth.user.profile['custom:role']) {
          try {
            userrole = JSON.parse(auth.user.profile['custom:role'] as string)
          } catch {
            userrole = { id: '3', name: 'STAFF' }
          }
        }
      } else if (auth.user?.id_token) {
        try {
          const decoded = jwtDecode<DecodedIdToken>(auth.user.id_token)
          username = decoded.name || decoded.email || decoded['cognito:username'] || 'unknown'

          if (decoded['custom:role']) {
            try {
              userrole = JSON.parse(decoded['custom:role'])
            } catch {
              userrole = { id: '3', name: 'STAFF' }
            }
          }
        } catch (err) {
          console.error('Failed to decode id_token:', err)
        }
      }
      setUser({ name: username, role: { id: userrole.id, name: userrole.name } })
    } else {
      setUser(null)
    }
  }, [ auth ])

  return user
}
