'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RequestInvitePage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    try {
      // If invite code provided, validate and redirect to signup
      if (inviteCode.trim()) {
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

        // Redirect to login with signup intent
        window.location.href = `/login?signup=1&code=${inviteCode.trim().toUpperCase()}&email=${encodeURIComponent(email)}`
        return
      }

      // Submit invite request
      const { error: insertError } = await supabase
        .from('invite_requests')
        .insert({
          email: email.trim(),
          message: message.trim() || null,
          status: 'pending',
        })

      if (insertError) {
        if (insertError.code === '23505') {
          setError("We already have your request. We'll be in touch.")
        } else {
          setError('Something went wrong. Try again.')
        }
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Try again.')
    }

    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-lg w-full">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-[3px] h-8 bg-accent" />
            <Link href="/" className="font-syne font-extrabold text-xl text-white">IDfy</Link>
          </div>

          <div className="border border-dark p-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent block mb-6">
              REQUEST RECEIVED
            </span>
            <h1 className="font-syne font-bold text-3xl text-white mb-4">
              You&apos;re on the list.
            </h1>
            <p className="font-mono text-sm text-mid leading-relaxed mb-8">
              We review requests manually. If you&apos;re a fit, you&apos;ll receive an invite code within 7 days.
            </p>
            <Link
              href="/"
              className="font-mono text-[11px] uppercase tracking-widest text-mid hover:text-white transition-colors"
            >
              ← Back to home
            </Link>
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
            REQUEST ACCESS
          </span>
          <h1 className="font-syne font-bold text-4xl text-white mb-3">
            Request an invite.
          </h1>
          <p className="font-mono text-sm text-mid">
            IDfy is invite-only. Tell us who you are.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">
              Email address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none transition-colors"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">
              Who are you and what do you bring?
              <span className="text-mid ml-2 normal-case tracking-normal">(optional, 280 chars)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 280))}
              placeholder="I'm a product designer with 8 years in fintech..."
              rows={4}
              className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none transition-colors resize-none"
            />
            <div className="text-right mt-1">
              <span className="font-mono text-[10px] text-mid">{message.length}/280</span>
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-mid block mb-2">
              Invite code
              <span className="text-mid ml-2 normal-case tracking-normal">(skip the queue)</span>
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="IDFY-XXXX"
              className="w-full bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none transition-colors font-mono tracking-widest"
            />
          </div>

          {error && (
            <p className="font-mono text-[11px] text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-black font-mono font-medium text-[12px] uppercase tracking-[0.15em] py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'SUBMITTING...' : inviteCode ? 'CONTINUE WITH CODE →' : 'SUBMIT REQUEST'}
          </button>
        </form>

        <div className="mt-8">
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-widest text-mid hover:text-white transition-colors"
          >
            Already have an account? Sign in →
          </Link>
        </div>
      </div>
    </div>
  )
}
