import { useState, useEffect } from 'react'

export function useUser() {
  const [ user, setUser ] = useState<{ name: string } | null>(null)

  useEffect(() => {
    // Development.
    setUser({ name: 'dev-user' })

    // Production.
    // const cognitoUser = await Auth.currentAuthenticatedUser()
    // setUser({ name: cognitoUser.username })
  }, [])

  return user
}
