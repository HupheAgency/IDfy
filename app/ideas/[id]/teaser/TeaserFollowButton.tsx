'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TeaserFollowButton({ ideaId }: { ideaId: string }) {
  const [showInput, setShowInput] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleFollow = async () => {
    if (!email.includes('@')) {
      setError('Enter a valid email address.')
      return
    }
    setSubmitting(true)
    setError('')

    const supabase = createClient()

    // Check if current user is logged in to link user_id
    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase
      .from('idea_followers')
      .insert({
        idea_id: ideaId,
        email: email.trim().toLowerCase(),
        user_id: user?.email?.toLowerCase() === email.trim().toLowerCase() ? user.id : null,
      })

    setSubmitting(false)

    if (insertError) {
      if (insertError.code === '23505') {
        // Already following
        setDone(true)
      } else {
        setError('Something went wrong. Try again.')
      }
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div
        style={{
          background: '#EEF5F0', border: '1px solid #3B6B4A', borderRadius: 12,
          padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
          marginBottom: '1rem',
        }}
      >
        <span style={{ fontSize: '1rem' }}>✓</span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.87rem', color: '#3B6B4A', fontWeight: 400 }}>
          You&apos;re following this idea. We&apos;ll notify you when something happens.
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          style={{
            background: '#111', color: '#F7F6F3', borderRadius: 100,
            padding: '0.7rem 1.6rem', fontSize: '0.87rem', fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", border: 'none', cursor: 'pointer',
          }}
        >
          Follow this idea
        </button>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={(e) => e.key === 'Enter' && handleFollow()}
              style={{
                flex: 1, padding: '0.65rem 1rem', borderRadius: 100,
                border: '1px solid #E5E3DC', fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.87rem', color: '#111', outline: 'none',
              }}
              autoFocus
            />
            <button
              onClick={handleFollow}
              disabled={submitting}
              style={{
                background: '#3B6B4A', color: '#fff', borderRadius: 100,
                padding: '0.65rem 1.2rem', fontSize: '0.85rem', fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? '…' : 'Follow'}
            </button>
          </div>
          {error && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#e55', marginTop: '0.3rem' }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
