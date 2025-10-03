'use client'
import { useState, useEffect } from 'react'
import { getCurrentUser } from '@aws-amplify/auth'
import { configureAmplify } from '@/lib/amplify'

export function useUser() {
  const [ user, setUser ] = useState<{ name: string } | null>(null)
  
  useEffect(() => {
    console.log('----- configureAmplify start. -----')
    configureAmplify()
    console.log('----- configureAmplify end. -----')
    const fetchUser = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          setUser({ name: 'dev-user' })
        } else {
          const cognitoUser = await getCurrentUser()
          console.log(cognitoUser.username)
          setUser({ name: cognitoUser.username })
        }
      } catch (error) {
        console.error('Failed to get user:', error)
        setUser(null)
      }
    }

    console.log('----- fetchUser start. -----')
    fetchUser()
    console.log('----- fetchUser end. -----')
  }, [])

  return user
}
