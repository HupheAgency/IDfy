import Link from 'next/link'
import { Idea, Profile } from '@/lib/types'

interface IdeaCardProps {
  idea: Idea & { profiles?: Profile }
  className?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#D3DFF0',
  Business:   '#F0E6D3',
  Creative:   '#D4E5D9',
  Science:    '#E5D4F0',
  Social:     '#F0D3D9',
  Other:      '#E5E3DC',
  // legacy
  Media:          '#F0E6D3',
  Health:         '#D4E5D9',
  Finance:        '#D3DFF0',
  Sustainability: '#D4E5D9',
}

const LAYER_BADGE: Record<number, { label: string; color: string }> = {
  1: { label: 'PRIVATE', color: '#999999' },
  2: { label: 'TEAM',    color: '#111111' },
  3: { label: 'OPEN',    color: '#3B6B4A' },
}

export default function IdeaCard({ idea, className = '' }: IdeaCardProps) {
  const creatorName = idea.profiles?.full_name || 'Anonymous'
  const initials = creatorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const date = new Date(idea.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const coverBg = idea.cover_image_url
    ? undefined
    : CATEGORY_COLORS[idea.category || 'Other'] || '#E5E3DC'

  const layer = idea.layer ?? 3
  const layerBadge = LAYER_BADGE[layer]

  return (
    <Link href={`/ideas/${idea.id}`} style={{ textDecoration: 'none' }}>
      <div
        className={className}
        style={{
          background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 16,
          overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#3B6B4A'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E3DC'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
        }}
      >
        {/* Cover / placeholder */}
        <div
          style={{
            height: 120, background: coverBg,
            backgroundImage: idea.cover_image_url ? `url(${idea.cover_image_url})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Layer badge */}
          <span
            style={{
              position: 'absolute', top: '0.6rem', left: '0.6rem',
              fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#fff', background: layerBadge.color,
              borderRadius: 100, padding: '0.18rem 0.55rem',
            }}
          >
            {layerBadge.label}
          </span>
          {/* Category */}
          {idea.category && (
            <span
              style={{
                position: 'absolute', bottom: '0.6rem', right: '0.6rem',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem',
                color: '#999', background: 'rgba(255,255,255,0.85)',
                borderRadius: 100, padding: '0.18rem 0.55rem',
              }}
            >
              {idea.category}
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '0.9rem 1rem' }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '0.88rem',
              color: '#111', lineHeight: 1.45, marginBottom: '0.75rem',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {idea.teaser}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: '#EEF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.62rem', fontWeight: 500, color: '#3B6B4A' }}>
                  {initials}
                </span>
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#999' }}>
                {creatorName}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {(idea.follower_count ?? 0) > 0 && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#999' }}>
                  {idea.follower_count} following
                </span>
              )}
              {idea.equity_offered_percent !== null && (
                <span
                  style={{
                    background: '#EEF5F0', color: '#3B6B4A',
                    borderRadius: 100, padding: '0.15rem 0.55rem',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', fontWeight: 500,
                  }}
                >
                  {idea.equity_offered_percent}%
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid #E5E3DC',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#CCCCCC' }}>
              Filed {date}
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', color: '#3B6B4A' }}>
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
