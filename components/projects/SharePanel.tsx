'use client'

import { useState } from 'react'

interface SharePanelProps {
  idea: {
    id: string
    teaser: string
    category: string | null
    equity_offered_percent: number | null
    follower_count?: number
  }
  projectName: string
  appUrl?: string
}

type CardType = 'contributor' | 'update' | 'launch'

export default function SharePanel({ idea, projectName, appUrl = '' }: SharePanelProps) {
  const [activeCard, setActiveCard] = useState<CardType>('contributor')
  const [updateBody, setUpdateBody] = useState('')
  const [launchBody, setLaunchBody] = useState('')
  const [launchUrl, setLaunchUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const teaserUrl = `${appUrl}/ideas/${idea.id}/teaser`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(teaserUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLinkedIn = () => {
    const text =
      activeCard === 'contributor'
        ? `Looking for contributors to join this project. ${idea.teaser}\n\n${teaserUrl}`
        : activeCard === 'update'
        ? `${projectName} — Update\n\n${updateBody}\n\nFollow: ${teaserUrl}`
        : `It's live.\n\n${launchBody}${launchUrl ? `\n\n${launchUrl}` : ''}\n\nBuilt on IDfy`
    const encoded = encodeURIComponent(text)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(teaserUrl)}&summary=${encoded}`, '_blank')
  }

  const cardTypes: { key: CardType; label: string }[] = [
    { key: 'contributor', label: 'Contributor call' },
    { key: 'update',      label: 'Project update' },
    { key: 'launch',      label: 'Launch' },
  ]

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Card type selector */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem' }}>
        {cardTypes.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveCard(key)}
            style={{
              borderRadius: 100, padding: '0.4rem 1rem', fontSize: '0.8rem',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
              background: activeCard === key ? '#3B6B4A' : '#fff',
              color: activeCard === key ? '#fff' : '#999',
              border: `1px solid ${activeCard === key ? '#3B6B4A' : '#E5E3DC'}`,
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Preview card */}
      <div
        style={{
          background: '#111', borderRadius: 16, overflow: 'hidden',
          aspectRatio: '1200 / 628', display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: '2rem',
          position: 'relative', marginBottom: '1.2rem',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)',
          width: 300, height: 150,
          background: 'radial-gradient(ellipse, rgba(59,107,74,0.5) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          {idea.category && (
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#7BC98A', display: 'block', marginBottom: '0.6rem',
            }}>
              {idea.category}
            </span>
          )}

          {activeCard === 'contributor' && (
            <>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#fff', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                {idea.teaser}
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem' }}>
                {(idea.follower_count ?? 0) > 0 ? `${idea.follower_count} people following · ` : ''}
                {idea.equity_offered_percent !== null ? `${idea.equity_offered_percent}% equity available` : 'NDA-gated'}
              </p>
            </>
          )}

          {activeCard === 'update' && (
            <>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>
                {projectName} — Update
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                {updateBody || 'Share a project update…'}
              </p>
            </>
          )}

          {activeCard === 'launch' && (
            <>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
                It&apos;s live.
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                {launchBody || 'Your launch message…'}
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#7BC98A', marginTop: '0.6rem' }}>
                Built on IDfy
              </p>
            </>
          )}

          <span style={{
            display: 'inline-block', marginTop: '0.8rem',
            fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.35)',
          }}>
            {teaserUrl}
          </span>
        </div>
      </div>

      {/* Edit fields */}
      {activeCard === 'update' && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.4rem' }}>
            Update text (max 280)
          </label>
          <textarea
            value={updateBody}
            onChange={(e) => setUpdateBody(e.target.value.slice(0, 280))}
            placeholder="Share what's happening with the project…"
            rows={3}
            style={{ width: '100%', padding: '0.65rem 0.9rem', resize: 'none', borderRadius: 10, border: '1px solid #E5E3DC' }}
          />
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#CCCCCC', textAlign: 'right', marginTop: '0.2rem' }}>
            {updateBody.length}/280
          </p>
        </div>
      )}

      {activeCard === 'launch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.4rem' }}>
              Launch message
            </label>
            <textarea
              value={launchBody}
              onChange={(e) => setLaunchBody(e.target.value)}
              placeholder="Describe what you've launched…"
              rows={3}
              style={{ width: '100%', padding: '0.65rem 0.9rem', resize: 'none', borderRadius: 10, border: '1px solid #E5E3DC' }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.4rem' }}>
              Launch URL (optional)
            </label>
            <input
              type="url"
              value={launchUrl}
              onChange={(e) => setLaunchUrl(e.target.value)}
              placeholder="https://yourproduct.com"
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10, border: '1px solid #E5E3DC' }}
            />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleCopyLink}
          style={{
            flex: 1, background: '#fff', color: '#111', border: '1px solid #E5E3DC',
            borderRadius: 100, padding: '0.65rem 1rem', fontSize: '0.83rem',
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
          }}
        >
          {copied ? '✓ Copied!' : 'Copy link'}
        </button>
        <button
          onClick={handleLinkedIn}
          style={{
            flex: 1, background: '#0077b5', color: '#fff', border: 'none',
            borderRadius: 100, padding: '0.65rem 1rem', fontSize: '0.83rem',
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: 500,
          }}
        >
          Open LinkedIn
        </button>
      </div>
    </div>
  )
}
