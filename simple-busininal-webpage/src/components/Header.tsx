'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import logo from '@/images/logo.webp'
import { useUser } from '@/hooks/useUser'
import { useAuth } from 'react-oidc-context'
import ConfirmDialog from '@/app/ConfirmDialog'
import { YesOrNo } from '@/types/YesOrNo'

const Header = () => {
  const user = useUser()
  const auth = useAuth()
  const [ isDialogOpen, setIsDialogOpen ] = useState(false)
  const handleUserClick = () => {
    setIsDialogOpen(true)
  }
  const handleDialogClose = async () => {
    setIsDialogOpen(false)
  }
  const handleJudge = async (result: YesOrNo) => {
    setIsDialogOpen(false)
    
    if (result === 'Yes') {
      try {
        return await auth.removeUser()
        // await auth.signoutRedirect()
        /*
        const domain = `https://${ process.env.NEXT_PUBLIC_USER_POOL_DOMAIN }`
        const clientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!
        const redirectUri = `${ window.location.origin }/`
        const logoutUrl = `${ domain }/logout?client_id=${ clientId }&logout_uri=${ encodeURIComponent(redirectUri) }`

        window.location.href = logoutUrl
        */
      } catch (err) {
        console.warn("Failed to remove OIDC user from storage:", err)
      }
    }
  }

  return (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <a
        href='https://www.bijininal.com/'
        target='_blank'
        rel='noopener noreferrer'
      >
      <Image
        src={ logo.src }
        width={ 220 }
        height={ 72 }
        alt='Logo Image'
        style={{ objectFit: 'contain' }}
      />
      </a>
      <div
        style={{ fontSize: '30px', cursor: 'pointer' }}
        onClick={ handleUserClick }
        title='クリックでログアウト'
      >
        { user ? `${ user.name }@${ user.role }` : 'loading...' }
      </div>
      <ConfirmDialog
        isOpen={ isDialogOpen }
        title='ログアウト確認'
        message='ログアウトしてもよろしいですか？'
        judge={ handleJudge }
        onClose={ handleDialogClose }
      />
    </div>
  )
}

export default Header