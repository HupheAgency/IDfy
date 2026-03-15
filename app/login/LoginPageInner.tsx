'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup' | 'magic'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  useEffect(() => {
    if (searchParams.get('signup') === '1') {
      setMode('signup')
      const code = searchParams.get('code')
      const emailParam = searchParams.get('email')
      if (code) setInviteCode(code)
      if (emailParam) setEmail(emailParam)
    }
  }, [searchParams])

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate invite code
    const { data: code } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode.trim().toUpperCase())
      .is('used_by', null)
      .single()

    if (!code) {
      setError("That invite code doesn't exist or has already been used.")
      setLoading(false)
      return
    }

    // Create account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!signUpData.user) {
      setError('Something went wrong. Try again.')
      setLoading(false)
      return
    }

    const userId = signUpData.user.id

    // Update profile with invite code
    await supabase
      .from('profiles')
      .update({
        invite_code_used: code.code,
        full_name: fullName,
      })
      .eq('id', userId)

    // Mark code as used
    await supabase
      .from('invite_codes')
      .update({
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('id', code.id)

    // Generate 5 new invite codes for the new user
    const newCodes = Array.from({ length: 5 }, () =>
      'IDFY-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    )

    await supabase.from('invite_codes').insert(
      newCodes.map((c) => ({ code: c, created_by: userId }))
    )

    router.push('/dashboard')
    router.refresh()
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (magicError) {
      setError('Could not send magic link. Try again.')
      setLoading(false)
      return
    }

    setMagicSent(true)
    setLoading(false)
  }

  if (magicSent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-[3px] h-8 bg-accent" />
            <Link href="/" className="font-syne font-extrabold text-xl text-white">IDfy</Link>
          </div>
          <div className="border border-dark p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent block mb-4">LINK SENT</span>
            <h2 className="font-syne font-bold text-2xl text-white mb-3">Check your email.</h2>
            <p className="font-mono text-sm text-mid">
              A magic link was sent to <span className="text-white">{email}</span>.
              Click it to sign in.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-[3px] h-8 bg-accent" />
          <Link href="/" className="font-syne font-extrabold text-xl text-white">IDfy</Link>
        </div>

        <div className="mb-8">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mid block mb-4">
            {mode === 'login' ? 'SIGN IN' : mode === 'signup' ? 'CREATE ACCOUNT' : 'MAGIC LINK'}
          </span>
          <h1 className="font-syne font-bold text-4xl text-white">
            {mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'Join IDfy.' : 'Sign in without a password.'}
          </h1>
          {mode === 'signup' && (
            <p className="font-mono text-sm text-mid mt-2">
              IDfy is invite-only. You need a valid invite code.
            </p>
          )}
        </div>

        {/* Mode tabs */}
        <div className="flex border border-dark mb-8">
          {[
            { key: 'login', label: 'PASSWORD' },
            { key: 'magic', label: 'MAGIC LINK' },
            { key: 'signup', label: 'CREATE ACCOUNT' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setMode(tab.key as Mode); setError('') }}
              className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                mode === tab.key
                  ? 'bg-dark text-white'
                  : 'text-mid hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Login form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none"
              />
            </div>
            {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        )}

        {/* Magic link form */}
        {mode === 'magic' && (
          <form onSubmit={handleMagicLink} className="space-y-5">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none"
              />
            </div>
            {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'SENDING...' : 'SEND MAGIC LINK'}
            </button>
          </form>
        )}

        {/* Signup form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">Full name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Chen"
                className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">
                Invite code *
              </label>
              <input
                type="text"
                required
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="IDFY-XXXX"
                className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none font-mono tracking-widest"
              />
            </div>
            {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        )}

        <div className="mt-8">
          <Link
            href="/request-invite"
            className="font-mono text-[11px] uppercase tracking-widest text-mid hover:text-white transition-colors"
          >
            Need an invite code? →
          </Link>
        </div>
      </div>
    </div>
  )
}
