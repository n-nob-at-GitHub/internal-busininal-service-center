'use client'
import React, { ReactNode } from 'react'
import AuthProviderWrapper from './AuthProvider'
import QueryClientProvider from './QueryClientProvider'

export default function Provider({ children }: { children: ReactNode }) {
  return (
    <AuthProviderWrapper>
      <QueryClientProvider>{ children }</QueryClientProvider>
    </AuthProviderWrapper>
  )
}

