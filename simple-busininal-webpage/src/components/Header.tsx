'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import logo from '@/images/logo.webp'
import { useUser } from '@/hooks/useUser'
import { useAuth } from 'react-oidc-context'
import ConfirmDialog from '@/app/ConfirmDialog'
import { YesOrNo } from '@/types/YesOrNo'
import { generateRandomString } from '@/lib/utils'

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
        await auth.removeUser()
        const domain = `https://${ process.env.NEXT_PUBLIC_USER_POOL_DOMAIN }`
        const clientId = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!
        const redirectUri = `${ window.location.origin }/`
        const state = generateRandomString(16)
        const nonce = generateRandomString(16)
        const scope = 'openid email profile'
        const logoutUrl = `${ domain }/logout?client_id=${ clientId }&logout_uri=${ encodeURIComponent(redirectUri) }&state=${ state }&nonce=${ nonce }&scope=${ scope }`

        window.location.href = logoutUrl
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
        style={{ fontSize: '30px' }}
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