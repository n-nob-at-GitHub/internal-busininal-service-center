'use client'
import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider as ReactQueryProvider } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export default function QueryClientProvider({ children }: { children: ReactNode }) {
  const queryClient =
    typeof window === 'undefined' ? makeQueryClient() : browserQueryClient ?? (browserQueryClient = makeQueryClient())

  return (
    <ReactQueryProvider client={ queryClient }>
      { children }
    </ReactQueryProvider>
  )
}
