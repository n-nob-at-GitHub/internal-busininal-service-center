import { useState, useEffect } from 'react'
import { 
  getCurrentUser 
} from 'aws-amplify/auth'

export function useUser() {
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          setUser({ name: 'dev-user' })
        } else {
          const cognitoUser = await getCurrentUser()
          setUser({ name: cognitoUser.username })
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
