import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Idea } from '@/lib/types'
import UpgradeLayerButton from './UpgradeLayerButton'

const LAYER_BADGE: Record<number, { label: string; bg: string; color: string }> = {
  1: { label: 'PRIVATE',  bg: '#E5E3DC', color: '#999' },
  2: { label: 'TEAM',     bg: '#E5E3DC', color: '#111' },
  3: { label: 'OPEN',     bg: '#EEF5F0', color: '#3B6B4A' },
}

export default async function MyIdeasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*, applications(count)')
    .eq('creator_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '2rem 2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#111', letterSpacing: '-0.03em' }}>
            My Ideas
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: '#999', marginTop: '0.2rem' }}>
            All layers visible only to you.
          </p>
        </div>
        <Link
          href="/ideas/new"
          style={{
            background: '#111', color: '#F7F6F3', borderRadius: 100,
            padding: '0.6rem 1.3rem', fontSize: '0.83rem', fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
          }}
        >
          + File an idea
        </Link>
      </div>

      {!ideas || ideas.length === 0 ? (
        <div
          style={{
            background: '#fff', border: '1px solid #E5E3DC', borderRadius: 16,
            padding: '3.5rem 2rem', textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: '#999', marginBottom: '0.5rem' }}>
            You haven&apos;t filed any ideas yet.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: '#CCCCCC', marginBottom: '1.5rem' }}>
            Start with a private workspace. No commitment. Just you and your idea.
          </p>
          <Link
            href="/ideas/new"
            style={{
              background: '#111', color: '#F7F6F3', borderRadius: 100,
              padding: '0.65rem 1.4rem', fontSize: '0.85rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
            }}
          >
            Start a private workspace
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {ideas.map((idea: Idea & { applications?: { count: number }[] }) => {
            const appCount = idea.applications?.[0]?.count || 0
            const layer = idea.layer ?? 3
            const badge = LAYER_BADGE[layer] || LAYER_BADGE[3]

            return (
              <div
                key={idea.id}
                style={{
                  background: '#fff', border: '1px solid #E5E3DC', borderRadius: 14,
                  padding: '1rem 1.2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.12em',
                          textTransform: 'uppercase', background: badge.bg, color: badge.color,
                          borderRadius: 100, padding: '0.18rem 0.55rem',
                        }}
                      >
                        {badge.label}
                      </span>
                      {idea.category && (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#999', background: '#F7F6F3', borderRadius: 100, padding: '0.18rem 0.6rem' }}>
                          {idea.category}
                        </span>
                      )}
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#CCCCCC' }}>
                        {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {appCount > 0 && (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#3B6B4A' }}>
                          {appCount} application{appCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <Link href={`/ideas/${idea.id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', color: '#111', lineHeight: 1.45, marginBottom: '0.7rem' }}>
                        {idea.teaser}
                      </p>
                    </Link>

                    {/* Upgrade buttons */}
                    {layer < 3 && (
                      <UpgradeLayerButton ideaId={idea.id} currentLayer={layer} hasTeaser={!!idea.teaser && idea.teaser.length > 5} />
                    )}
                    {layer === 3 && (
                      <Link
                        href={`/ideas/${idea.id}/teaser`}
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#3B6B4A', textDecoration: 'none' }}
                      >
                        View public teaser →
                      </Link>
                    )}
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem',
                      color: idea.status === 'active' ? '#3B6B4A' : '#999',
                      background: idea.status === 'active' ? '#EEF5F0' : '#F7F6F3',
                      borderRadius: 100, padding: '0.2rem 0.7rem',
                    }}>
                      {idea.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
