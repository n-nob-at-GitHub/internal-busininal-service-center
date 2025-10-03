'use client'
import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

interface DecodedIdToken {
  'cognito:username'?: string
  name?: string
  email?: string
  [ key: string ]: any
}

export function useUser() {
  const [ user, setUser ] = useState<{ name: string } | null>(null)
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          setUser({ name: 'dev-user' })
        } else {
          const hash = window.location.hash
          const params = new URLSearchParams(hash.replace(/^#/, ''))
          const idToken = params.get('id_token')
          if (idToken) {
            const decoded = jwtDecode<DecodedIdToken>(idToken)
            const username = decoded.name || decoded.email || decoded['cognito:username'] || 'unknown'
            setUser({ name: username })
          } else {
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Failed to get user:', error)
        setUser(null)
      }
    }

    fetchUser()
  }, [])

  return user
}
