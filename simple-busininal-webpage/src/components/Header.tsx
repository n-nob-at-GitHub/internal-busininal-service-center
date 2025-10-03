'use client'
import React from 'react'
import Image from 'next/image'
import logo from '@/images/logo.webp'
import { useUser } from '@/hooks/useUser'

const Header = () => {
  const user = useUser()
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
      <div style={{ fontSize: '30px' }}>
        { user ? `${ user.name }@${ user.role }` : 'loading...' }
      </div>
    </div>
  )
}

export default Header