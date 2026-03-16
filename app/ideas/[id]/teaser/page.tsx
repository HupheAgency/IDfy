import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TeaserFollowButton from './TeaserFollowButton'

const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#D3DFF0', Business: '#F0E6D3', Creative: '#D4E5D9',
  Science: '#E5D4F0', Social: '#F0D3D9', Other: '#E5E3DC',
  Media: '#F0E6D3', Health: '#D4E5D9', Finance: '#D3DFF0', Sustainability: '#D4E5D9',
}

export default async function TeaserPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: idea } = await supabase
    .from('ideas')
    .select('id, teaser, category, equity_offered_percent, cover_image_url, layer, status, created_at, creator_id')
    .eq('id', params.id)
    .single()

  // Only show Layer 3 active ideas
  if (!idea || idea.layer !== 3 || idea.status !== 'active') {
    notFound()
  }

  // Follower count
  const { count: followerCount } = await supabase
    .from('idea_followers')
    .select('id', { count: 'exact', head: true })
    .eq('idea_id', idea.id)

  const date = new Date(idea.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  const bgColor = CATEGORY_COLORS[idea.category || 'Other'] || '#E5E3DC'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://i-dfy.vercel.app'
  const shareUrl = `${appUrl}/ideas/${idea.id}/teaser`

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F3' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid #E5E3DC', padding: '0 1.5rem',
        height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(247,246,243,0.95)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', color: '#111' }}>
          <span style={{ color: '#3B6B4A' }}>ID</span>fy
        </Link>
        <Link
          href="/request-invite"
          style={{
            background: '#111', color: '#F7F6F3', borderRadius: 100,
            padding: '0.45rem 1.1rem', fontSize: '0.78rem', fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
          }}
        >
          Request invite ▶
        </Link>
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '4rem 1.5rem 5rem' }}>
        {/* Cover */}
        <div
          style={{
            height: 240, borderRadius: 16, marginBottom: '2.5rem', overflow: 'hidden',
            background: idea.cover_image_url ? undefined : bgColor,
            backgroundImage: idea.cover_image_url ? `url(${idea.cover_image_url})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}
        />

        {/* Category + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {idea.category && (
            <span style={{
              background: '#EEF5F0', color: '#3B6B4A', borderRadius: 100,
              padding: '0.25rem 0.8rem', fontSize: '0.75rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {idea.category}
            </span>
          )}
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#CCCCCC' }}>
            Filed {date}
          </span>
        </div>

        {/* Teaser headline */}
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.04em',
          lineHeight: 1.1, color: '#111', marginBottom: '1.5rem',
        }}>
          {idea.teaser}
        </h1>

        {/* Equity badge */}
        {idea.equity_offered_percent !== null && (
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              background: '#EEF5F0', color: '#3B6B4A', borderRadius: 100,
              padding: '0.35rem 1rem', fontSize: '0.83rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {idea.equity_offered_percent}% equity available for contributors
            </span>
          </div>
        )}

        {/* Follower count */}
        {(followerCount ?? 0) > 0 && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: '#999', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 500, color: '#111' }}>{followerCount}</span> {followerCount === 1 ? 'person is' : 'people are'} following this idea
          </p>
        )}

        {/* Follow CTA */}
        <TeaserFollowButton ideaId={idea.id} />

        {/* Divider */}
        <div style={{ borderTop: '1px solid #E5E3DC', margin: '2.5rem 0' }} />

        {/* Join CTA */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: '#999', marginBottom: '1rem' }}>
            Want to contribute to this idea?
          </p>
          <Link
            href="/request-invite"
            style={{
              background: '#111', color: '#F7F6F3', borderRadius: 100,
              padding: '0.7rem 1.6rem', fontSize: '0.85rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
            }}
          >
            Join IDfy →
          </Link>
        </div>
      </main>
    </div>
  )
}
