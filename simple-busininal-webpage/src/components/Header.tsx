'use client'
import React, { useEffect } from 'react'
import Image from 'next/image'
import logo from '@/images/logo.webp'
import { configureAmplify } from '@/lib/amplify'
import { useUser } from '@/hooks/useUser'

const Header = () => {
  useEffect(() => {
    console.log('----- Header configureAmplify start. -----')
    configureAmplify()
    console.log('----- Header configureAmplify end. -----')
  }, [])
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
        { user ? user.name : 'loading...' }
      </div>
    </div>
  )
}

export default Header