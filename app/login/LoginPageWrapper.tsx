'use client'

import { Suspense } from 'react'
import LoginPage from './LoginPageInner'

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="font-mono text-[11px] text-mid uppercase tracking-widest">Loading...</span>
      </div>
    }>
      <LoginPage />
    </Suspense>
  )
}
