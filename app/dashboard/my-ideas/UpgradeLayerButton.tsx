'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  ideaId: string
  currentLayer: number
  hasTeaser: boolean
}

export default function UpgradeLayerButton({ ideaId, currentLayer, hasTeaser }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [emails, setEmails] = useState('')

  const upgrade = async (targetLayer: number) => {
    setLoading(true)
    const supabase = createClient()

    if (targetLayer === 2 && showEmailInput) {
      // Send team invitations
      const { data: { user } } = await supabase.auth.getUser()
      const emailList = emails.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean)
      for (const email of emailList) {
        await supabase.from('idea_invitations').insert({
          idea_id: ideaId,
          invited_by: user!.id,
          invited_email: email,
        })
      }
    }

    await supabase.from('ideas').update({ layer: targetLayer }).eq('id', ideaId)
    setLoading(false)
    router.refresh()
  }

  if (currentLayer === 1) {
    return (
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
        {!showEmailInput ? (
          <>
            <button
              onClick={() => setShowEmailInput(true)}
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#999',
                background: 'transparent', border: '1px solid #E5E3DC', borderRadius: 100,
                padding: '0.3rem 0.8rem', cursor: 'pointer',
              }}
            >
              Invite team members →
            </button>
            <button
              onClick={() => upgrade(3)}
              disabled={loading || !hasTeaser}
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#3B6B4A',
                background: 'transparent', border: '1px solid #3B6B4A', borderRadius: 100,
                padding: '0.3rem 0.8rem', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: hasTeaser ? 1 : 0.4,
              }}
              title={hasTeaser ? 'Make public' : 'Add a teaser first to open to contributors'}
            >
              {loading ? '…' : 'Open to contributors →'}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="teammate@email.com, partner@email.com"
              rows={2}
              style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #E5E3DC', fontSize: '0.82rem', resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => setShowEmailInput(false)}
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#999', background: 'transparent', border: '1px solid #E5E3DC', borderRadius: 100, padding: '0.3rem 0.8rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => upgrade(2)}
                disabled={loading || !emails.trim()}
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#fff', background: '#111', border: 'none', borderRadius: 100, padding: '0.3rem 0.8rem', cursor: 'pointer' }}
              >
                {loading ? '…' : 'Invite & upgrade to team'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (currentLayer === 2) {
    return (
      <button
        onClick={() => upgrade(3)}
        disabled={loading || !hasTeaser}
        style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#3B6B4A',
          background: 'transparent', border: '1px solid #3B6B4A', borderRadius: 100,
          padding: '0.3rem 0.8rem', cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '0.4rem', opacity: hasTeaser ? 1 : 0.4,
        }}
      >
        {loading ? '…' : 'Open to contributors →'}
      </button>
    )
  }

  return null
}
