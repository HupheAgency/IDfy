'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['Technology', 'Business', 'Creative', 'Science', 'Social', 'Other']

async function sha256Hash(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

const LAYER_OPTIONS = [
  {
    layer: 1,
    title: 'Private workspace',
    subtitle: 'Just me.',
    description: 'A structured place to develop my idea. Not visible to anyone else.',
    icon: '🔒',
  },
  {
    layer: 2,
    title: 'Team workspace',
    subtitle: 'Trusted team.',
    description: 'I have a small trusted team. We work together privately.',
    icon: '◉',
  },
  {
    layer: 3,
    title: 'Open platform',
    subtitle: "I'm ready.",
    description: 'Show my teaser publicly and find contributors.',
    icon: '✦',
  },
]

type Step = 0 | 1 | 2 | 3

export default function NewIdeaPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [layer, setLayer] = useState<1 | 2 | 3 | null>(null)
  const [teaser, setTeaser] = useState('')
  const [teamEmails, setTeamEmails] = useState('')
  const [fullDescription, setFullDescription] = useState('')
  const [whyItDoesntExist, setWhyItDoesntExist] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [category, setCategory] = useState('')
  const [equityPercent, setEquityPercent] = useState(10)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    const url = URL.createObjectURL(file)
    setCoverPreview(url)
  }

  const handleSubmit = async () => {
    if (!layer) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Upload cover image if provided
    let coverImageUrl: string | null = null
    if (coverFile) {
      const ext = coverFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('idea-covers')
        .upload(path, coverFile, { contentType: coverFile.type })
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('idea-covers').getPublicUrl(path)
        coverImageUrl = urlData.publicUrl
      }
    }

    const now = new Date().toISOString()
    const hashInput = (fullDescription || teaser) + now
    const timestampHash = await sha256Hash(hashInput)

    const { data: idea, error: insertError } = await supabase
      .from('ideas')
      .insert({
        creator_id: user.id,
        teaser: layer === 1 ? (teaser || 'Private workspace idea') : teaser,
        full_description: fullDescription || null,
        why_it_doesnt_exist: whyItDoesntExist || null,
        target_audience: targetAudience || null,
        category: category || 'Other',
        equity_offered_percent: layer === 3 ? equityPercent : null,
        timestamp_hash: timestampHash,
        status: 'active',
        layer,
        cover_image_url: coverImageUrl,
      })
      .select()
      .single()

    if (insertError) {
      setError('Failed to file idea. Try again.')
      setLoading(false)
      return
    }

    // Send team invitations for Layer 2
    if (layer === 2 && teamEmails.trim()) {
      const emails = teamEmails.split(/[\n,]+/).map((e) => e.trim()).filter(Boolean)
      for (const email of emails) {
        await supabase.from('idea_invitations').insert({
          idea_id: idea.id,
          invited_by: user.id,
          invited_email: email,
        })
      }
    }

    router.push(`/ideas/${idea.id}`)
  }

  const totalSteps = layer === 1 ? 2 : 3
  const stepLabels = layer === 1
    ? ['Workspace', 'Your idea', 'Confirm']
    : layer === 2
    ? ['Workspace', 'Your teaser', 'The details', 'Confirm']
    : ['Workspace', 'Your teaser', 'The details', 'Confirm']

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F3' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3B6B4A' }}>
            File an idea
          </span>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.04em', color: '#111', marginTop: '0.3rem' }}>
            {step === 0 ? 'Choose your workspace.' :
             step === 1 ? (layer === 1 ? 'Describe your idea.' : 'Write your teaser.') :
             step === 2 ? 'The full story.' :
             'Ready to file.'}
          </h1>
        </div>

        {/* Progress */}
        {step > 0 && layer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem' }}>
            {[1, 2, 3].slice(0, layer === 1 ? 2 : 3).map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
                    background: s < step ? '#3B6B4A' : s === step ? '#111' : '#fff',
                    color: s <= step ? '#fff' : '#999',
                    border: s > step ? '1px solid #E5E3DC' : 'none',
                    flexShrink: 0,
                  }}
                >
                  {s < step ? '✓' : s}
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: s === step ? '#111' : '#999' }}>
                  {stepLabels[s]}
                </span>
                {s < (layer === 1 ? 2 : 3) && (
                  <div style={{ width: 20, height: 1, background: '#E5E3DC', marginRight: '0.2rem' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 0: Layer selection */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {LAYER_OPTIONS.map((opt) => (
              <button
                key={opt.layer}
                onClick={() => setLayer(opt.layer as 1 | 2 | 3)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  padding: '1.1rem 1.2rem', borderRadius: 14, cursor: 'pointer',
                  background: layer === opt.layer ? '#EEF5F0' : '#fff',
                  border: `1.5px solid ${layer === opt.layer ? '#3B6B4A' : '#E5E3DC'}`,
                  textAlign: 'left', transition: 'all 0.15s',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: '1.2rem', marginTop: '0.1rem' }}>{opt.icon}</span>
                <div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#111', marginBottom: '0.1rem' }}>
                    {opt.title}
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '0.8rem', color: '#3B6B4A', marginBottom: '0.3rem' }}>
                    {opt.subtitle}
                  </p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.83rem', color: '#999' }}>
                    {opt.description}
                  </p>
                </div>
              </button>
            ))}

            <button
              onClick={() => { if (layer) setStep(1) }}
              disabled={!layer}
              style={{
                marginTop: '0.8rem', background: '#111', color: '#F7F6F3',
                borderRadius: 100, padding: '0.75rem 1.8rem', fontSize: '0.87rem',
                fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                border: 'none', cursor: layer ? 'pointer' : 'not-allowed',
                opacity: layer ? 1 : 0.35, width: '100%',
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 1: Teaser (Layer 3) / Description (Layer 1+2) */}
        {step === 1 && layer && (
          <div>
            {layer === 3 && (
              <>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.88rem', color: '#999', marginBottom: '1.5rem' }}>
                  One sentence. Vague enough to protect. Sharp enough to trigger.
                </p>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                    Your teaser
                  </label>
                  <textarea
                    value={teaser}
                    onChange={(e) => setTeaser(e.target.value.slice(0, 140))}
                    placeholder="A platform that turns your voice memos into fundable startup pitches automatically."
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem 1rem', resize: 'none', lineHeight: 1.6 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#CCCCCC' }}>
                      Vague enough to intrigue. Not enough to steal.
                    </span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: teaser.length > 120 ? '#3B6B4A' : '#CCCCCC' }}>
                      {teaser.length}/140
                    </span>
                  </div>
                </div>
              </>
            )}

            {layer === 2 && (
              <>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.88rem', color: '#999', marginBottom: '1.5rem' }}>
                  Write a brief teaser visible to your team, then invite them by email.
                </p>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                    Teaser (internal)
                  </label>
                  <textarea
                    value={teaser}
                    onChange={(e) => setTeaser(e.target.value.slice(0, 140))}
                    placeholder="A brief internal title for your team."
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem 1rem', resize: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                    Invite team members (email addresses, one per line)
                  </label>
                  <textarea
                    value={teamEmails}
                    onChange={(e) => setTeamEmails(e.target.value)}
                    placeholder="colleague@email.com&#10;partner@email.com"
                    rows={4}
                    style={{ width: '100%', padding: '0.75rem 1rem', resize: 'none' }}
                  />
                </div>
              </>
            )}

            {layer === 1 && (
              <>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.88rem', color: '#999', marginBottom: '1.5rem' }}>
                  Describe your idea. This is your private workspace — no one else sees it.
                </p>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                    What is your idea?
                  </label>
                  <textarea
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Describe your idea in full..."
                    rows={7}
                    style={{ width: '100%', padding: '0.75rem 1rem', resize: 'none', lineHeight: 1.6 }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                    Category
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        style={{
                          borderRadius: 100, padding: '0.4rem 1rem', fontSize: '0.82rem',
                          fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                          background: category === cat ? '#3B6B4A' : '#fff',
                          color: category === cat ? '#fff' : '#999',
                          border: `1px solid ${category === cat ? '#3B6B4A' : '#E5E3DC'}`,
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Cover image upload (all layers) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                Cover image (optional)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '1.5px dashed #E5E3DC', borderRadius: 12, padding: '1.2rem',
                  textAlign: 'center', cursor: 'pointer',
                  background: coverPreview ? 'transparent' : '#fff',
                  overflow: 'hidden', position: 'relative',
                  minHeight: coverPreview ? 140 : 80,
                }}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 160 }} />
                ) : (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.83rem', color: '#CCCCCC' }}>
                    Upload cover image — Recommended 1200×800px
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setStep(0)}
                style={{
                  flex: 1, background: '#fff', color: '#999',
                  border: '1px solid #E5E3DC', borderRadius: 100,
                  padding: '0.75rem', fontSize: '0.87rem',
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => layer === 1 ? setStep(3) : setStep(2)}
                disabled={layer === 3 ? teaser.trim().length < 10 : layer === 2 ? teaser.trim().length < 3 : !fullDescription.trim()}
                style={{
                  flex: 2, background: '#111', color: '#F7F6F3',
                  border: 'none', borderRadius: 100,
                  padding: '0.75rem', fontSize: '0.87rem', fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  opacity: (layer === 3 ? teaser.trim().length >= 10 : layer === 2 ? teaser.trim().length >= 3 : !!fullDescription.trim()) ? 1 : 0.35,
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Full details (Layer 2 & 3 only) */}
        {step === 2 && layer && layer !== 1 && (
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.88rem', color: '#999', marginBottom: '1.5rem' }}>
              This is NDA-gated. Only people who sign will read it.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                  Full description — What is it, how does it work?
                </label>
                <textarea
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Describe your idea in full detail..."
                  rows={6}
                  style={{ width: '100%', padding: '0.75rem 1rem', resize: 'none', lineHeight: 1.6 }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                  Why doesn&apos;t it exist yet?
                </label>
                <textarea
                  value={whyItDoesntExist}
                  onChange={(e) => setWhyItDoesntExist(e.target.value)}
                  placeholder="What gap does this fill? Why now?"
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem 1rem', resize: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                  Who is the target audience?
                </label>
                <textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Who has this problem? How big is the market?"
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem 1rem', resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                  Category
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        borderRadius: 100, padding: '0.4rem 1rem', fontSize: '0.82rem',
                        fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                        background: category === cat ? '#3B6B4A' : '#fff',
                        color: category === cat ? '#fff' : '#999',
                        border: `1px solid ${category === cat ? '#3B6B4A' : '#E5E3DC'}`,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {layer === 3 && (
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.5rem' }}>
                    Equity available — {equityPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="49"
                    value={equityPercent}
                    onChange={(e) => setEquityPercent(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#3B6B4A' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#CCCCCC' }}>0%</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#3B6B4A', fontWeight: 500 }}>{equityPercent}%</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#CCCCCC' }}>49%</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1, background: '#fff', color: '#999',
                  border: '1px solid #E5E3DC', borderRadius: 100,
                  padding: '0.75rem', fontSize: '0.87rem',
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!fullDescription.trim() || !category}
                style={{
                  flex: 2, background: '#111', color: '#F7F6F3',
                  border: 'none', borderRadius: 100,
                  padding: '0.75rem', fontSize: '0.87rem', fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  opacity: (fullDescription.trim() && category) ? 1 : 0.35,
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && layer && (
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.88rem', color: '#999', marginBottom: '1.5rem' }}>
              Review what will be filed, then confirm.
            </p>

            {/* Summary card */}
            <div
              style={{
                background: '#fff', border: '1px solid #E5E3DC', borderRadius: 14,
                padding: '1.2rem', marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: layer === 1 ? '#999' : layer === 2 ? '#111' : '#fff',
                  background: layer === 1 ? '#E5E3DC' : layer === 2 ? '#E5E3DC' : '#3B6B4A',
                  borderRadius: 100, padding: '0.2rem 0.6rem',
                }}>
                  {layer === 1 ? 'PRIVATE' : layer === 2 ? 'TEAM' : 'OPEN'}
                </span>
                {category && (
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#999', background: '#F7F6F3', borderRadius: 100, padding: '0.2rem 0.7rem' }}>
                    {category}
                  </span>
                )}
                {layer === 3 && (
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#3B6B4A', background: '#EEF5F0', borderRadius: 100, padding: '0.2rem 0.7rem' }}>
                    {equityPercent}% equity
                  </span>
                )}
              </div>
              {teaser && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#111', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  {teaser}
                </p>
              )}
              {coverPreview && (
                <img src={coverPreview} alt="Cover" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 100, marginTop: '0.5rem' }} />
              )}
            </div>

            <div
              style={{
                background: '#F7F6F3', border: '1px solid #E5E3DC', borderRadius: 12,
                padding: '0.9rem 1rem', marginBottom: '1.2rem',
              }}
            >
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.82rem', color: '#999', lineHeight: 1.6 }}>
                By filing this idea you agree to IDfy&apos;s terms. Your idea will be automatically timestamped and a cryptographic record will be created.
              </p>
            </div>

            {error && (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: '#e55', marginBottom: '0.8rem' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setStep(layer === 1 ? 1 : 2)}
                style={{
                  flex: 1, background: '#fff', color: '#999',
                  border: '1px solid #E5E3DC', borderRadius: 100,
                  padding: '0.75rem', fontSize: '0.87rem',
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 2, background: '#3B6B4A', color: '#fff',
                  border: 'none', borderRadius: 100,
                  padding: '0.75rem', fontSize: '0.87rem', fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Filing…' : 'File this idea'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
