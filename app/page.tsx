'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Idea } from '@/lib/types'

const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#D3DFF0',
  Business:   '#F0E6D3',
  Creative:   '#D4E5D9',
  Science:    '#E5D4F0',
  Social:     '#F0D3D9',
  Other:      '#E5E3DC',
  // legacy categories
  Media:          '#F0E6D3',
  Health:         '#D4E5D9',
  Finance:        '#D3DFF0',
  Sustainability: '#D4E5D9',
}

function IdeaTile({
  idea,
  tall = false,
  className = '',
}: {
  idea: Idea | null
  tall?: boolean
  className?: string
}) {
  const [hovered, setHovered] = useState(false)
  const bg = idea?.cover_image_url
    ? undefined
    : CATEGORY_COLORS[idea?.category || 'Other'] || '#E5E3DC'

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius: 16 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-transform duration-500"
        style={{
          backgroundColor: bg,
          backgroundImage: idea?.cover_image_url
            ? `url(${idea.cover_image_url})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
        }}
      />
      {/* Gradient overlay */}
      {idea && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
          }}
        />
      )}

      {/* Content */}
      {idea ? (
        <Link href={`/ideas/${idea.id}/teaser`} className="absolute inset-0 p-4 flex flex-col justify-end">
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              display: 'block',
              marginBottom: '0.3rem',
            }}
          >
            {idea.category || 'Other'}
          </span>
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: tall ? '1.05rem' : '0.85rem',
              color: '#ffffff',
              lineHeight: 1.25,
              marginBottom: '0.5rem',
            }}
          >
            {idea.teaser.length > 60 ? idea.teaser.slice(0, 60) + '…' : idea.teaser}
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(idea.follower_count ?? 0) > 0 && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 100,
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.68rem',
                  color: '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {idea.follower_count} following
              </span>
            )}
            {idea.equity_offered_percent !== null ? (
              <span
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 100,
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.68rem',
                  color: '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {idea.equity_offered_percent}% equity
              </span>
            ) : (
              <span
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 100,
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                🔒 NDA required
              </span>
            )}
          </div>
        </Link>
      ) : (
        <div className="absolute inset-0" />
      )}
    </div>
  )
}

const PLACEHOLDER_IDEAS: Idea[] = [
  {
    id: '1', creator_id: '', teaser: 'A platform that turns your voice memos into fundable startup pitches.',
    full_description: null, category: 'Technology', target_audience: null, why_it_doesnt_exist: null,
    equity_offered_percent: 15, status: 'active', timestamp_hash: null, layer: 3, cover_image_url: null,
    follower_count: 84, created_at: '', updated_at: '',
  },
  {
    id: '2', creator_id: '', teaser: 'Community ownership model for independent coffee shops.',
    full_description: null, category: 'Business', target_audience: null, why_it_doesnt_exist: null,
    equity_offered_percent: null, status: 'active', timestamp_hash: null, layer: 3, cover_image_url: null,
    follower_count: 42, created_at: '', updated_at: '',
  },
  {
    id: '3', creator_id: '', teaser: 'Climate-based insurance products for smallholder farmers in West Africa.',
    full_description: null, category: 'Social', target_audience: null, why_it_doesnt_exist: null,
    equity_offered_percent: 20, status: 'active', timestamp_hash: null, layer: 3, cover_image_url: null,
    follower_count: 127, created_at: '', updated_at: '',
  },
  {
    id: '4', creator_id: '', teaser: 'A browser extension that turns any article into an interactive debate.',
    full_description: null, category: 'Creative', target_audience: null, why_it_doesnt_exist: null,
    equity_offered_percent: 10, status: 'active', timestamp_hash: null, layer: 3, cover_image_url: null,
    follower_count: 31, created_at: '', updated_at: '',
  },
  {
    id: '5', creator_id: '', teaser: 'Decentralised peer review for pre-print scientific papers.',
    full_description: null, category: 'Science', target_audience: null, why_it_doesnt_exist: null,
    equity_offered_percent: null, status: 'active', timestamp_hash: null, layer: 3, cover_image_url: null,
    follower_count: 63, created_at: '', updated_at: '',
  },
]

export default function LandingPage() {
  const [heroVisible, setHeroVisible] = useState(false)
  const [gridIdeas, setGridIdeas] = useState<Idea[]>(PLACEHOLDER_IDEAS)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80)
    return () => clearTimeout(timer)
  }, [])

  // Fetch real Layer 3 ideas for the grid
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('ideas')
      .select('id, teaser, category, equity_offered_percent, cover_image_url, layer, status, created_at, updated_at, creator_id, timestamp_hash')
      .eq('status', 'active')
      .eq('layer', 3)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data && data.length >= 3) {
          setGridIdeas(data as Idea[])
        }
      })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('section-hidden')
            entry.target.classList.add('section-visible')
          }
        })
      },
      { threshold: 0.08 }
    )
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })
    return () => observer.disconnect()
  }, [])

  const fadeStyle = (show: boolean, delay: number) => ({
    opacity: show ? 1 : 0,
    transform: show ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.7s ease-out ${delay}s, transform 0.7s ease-out ${delay}s`,
  })

  const tiles = [...gridIdeas]
  while (tiles.length < 5) tiles.push(PLACEHOLDER_IDEAS[tiles.length] || PLACEHOLDER_IDEAS[0])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#F7F6F3', color: '#111111' }}>

      {/* Nav */}
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(247,246,243,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E5E3DC',
          padding: '0 1.5rem',
          height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.15rem', textDecoration: 'none', color: '#111' }}>
          <span style={{ color: '#3B6B4A' }}>ID</span>fy
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#how-it-works" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#999', textDecoration: 'none' }}>
            How it works
          </a>
          <a href="#for-builders" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem', color: '#999', textDecoration: 'none' }}>
            For builders
          </a>
          <Link
            href="/request-invite"
            style={{
              background: '#111111', color: '#F7F6F3', borderRadius: 100,
              padding: '0.5rem 1.2rem', fontSize: '0.78rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            Request invite ▶
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '5.5rem', paddingBottom: '2.5rem', textAlign: 'center', maxWidth: 760, margin: '0 auto', padding: '5.5rem 1.5rem 2.5rem' }}>
        {/* Badge */}
        <div style={fadeStyle(heroVisible, 0)}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff', border: '1px solid #E5E3DC', borderRadius: 100,
              padding: '0.35rem 1rem', fontSize: '0.78rem',
              fontFamily: "'DM Sans', sans-serif", color: '#999',
              marginBottom: '1.8rem',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3B6B4A', display: 'inline-block' }} />
            247 ideas filed · By invitation only
          </span>
        </div>

        <h1
          style={{
            ...fadeStyle(heroVisible, 0.1),
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            letterSpacing: '-0.05em',
            lineHeight: 1.05,
            marginBottom: '1.25rem',
          }}
        >
          Where ideas find the people<br />
          who make them{' '}
          <span style={{ color: '#3B6B4A' }}>real.</span>
        </h1>

        <p
          style={{
            ...fadeStyle(heroVisible, 0.25),
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
            fontSize: '0.95rem',
            color: '#999999',
            maxWidth: '36ch',
            margin: '0 auto 2.2rem',
            lineHeight: 1.6,
          }}
        >
          File your idea, protect it with a timestamp, find contributors who are as serious as you are.
        </p>

        <div
          style={{
            ...fadeStyle(heroVisible, 0.4),
            display: 'flex', justifyContent: 'center', gap: '0.8rem',
          }}
        >
          <Link
            href="/request-invite"
            style={{
              background: '#111', color: '#F7F6F3', borderRadius: 100,
              padding: '0.75rem 1.8rem', fontSize: '0.87rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
            }}
          >
            Request an invite
          </Link>
          <a
            href="#how-it-works"
            style={{
              background: '#fff', color: '#111', border: '1px solid #E5E3DC', borderRadius: 100,
              padding: '0.75rem 1.8rem', fontSize: '0.87rem', fontWeight: 400,
              fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
            }}
          >
            How it works
          </a>
        </div>
      </section>

      {/* Masonry grid */}
      <div
        style={{ ...fadeStyle(heroVisible, 0.6), padding: '0 1.2rem 1.4rem' }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr',
            gridTemplateRows: '220px 200px',
            gap: '0.7rem',
          }}
        >
          <IdeaTile idea={tiles[0]} tall style={{ gridColumn: '1', gridRow: '1 / 3' }} />
          <IdeaTile idea={tiles[1]} style={{ gridColumn: '2', gridRow: '1' }} />
          <IdeaTile idea={tiles[2]} style={{ gridColumn: '3', gridRow: '1' }} />
          <IdeaTile idea={tiles[3]} style={{ gridColumn: '2', gridRow: '2' }} />
          <IdeaTile idea={tiles[4]} style={{ gridColumn: '3', gridRow: '2' }} />
        </div>
      </div>

      {/* For Builders */}
      <section
        id="for-builders"
        ref={(el) => { sectionRefs.current[0] = el }}
        className="section-hidden"
        style={{ padding: '5rem 1.5rem', maxWidth: 960, margin: '0 auto' }}
      >
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '0.8rem' }}>
          FOR BUILDERS
        </span>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', letterSpacing: '-0.04em', marginBottom: '1rem', lineHeight: 1.1 }}>
          You can execute.<br />Find the right idea.
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: '#999', maxWidth: 480, lineHeight: 1.7 }}>
          Browse real ideas from people who have thought hard about what they want to build. Apply with your terms. Get equity from day one.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem' }}>
          {['Technology', 'Business', 'Creative', 'Science', 'Social', 'Other'].map((cat) => (
            <span
              key={cat}
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem',
                color: '#999', border: '1px solid #E5E3DC', borderRadius: 100,
                padding: '0.35rem 0.9rem',
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        ref={(el) => { sectionRefs.current[1] = el }}
        className="section-hidden"
        style={{ padding: '5rem 1.5rem', maxWidth: 960, margin: '0 auto' }}
      >
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3B6B4A', display: 'block', marginBottom: '2.5rem' }}>
          HOW IT WORKS
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
          {[
            { num: '01', icon: '🔒', label: 'File', desc: 'Submit your idea with a teaser. Full details stay hidden.' },
            { num: '02', icon: '✦',  label: 'Tease', desc: 'Your teaser surfaces in the feed. Contributors discover it.' },
            { num: '03', icon: '📋', label: 'Gate', desc: 'Interested parties sign an NDA. Then they read everything.' },
            { num: '04', icon: '🤝', label: 'Deal', desc: 'Agree on equity. Project workspace opens. Build.' },
          ].map((step) => (
            <div
              key={step.num}
              style={{
                background: '#fff', border: '1px solid #E5E3DC', borderRadius: 16,
                padding: '1.4rem',
              }}
            >
              <div style={{ background: '#EEF5F0', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem', fontSize: '1.1rem' }}>
                {step.icon}
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '0.4rem' }}>{step.num}</span>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.35rem', marginBottom: '0.5rem', color: '#111' }}>{step.label}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: '#999', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA block */}
      <section
        ref={(el) => { sectionRefs.current[2] = el }}
        className="section-hidden"
        style={{ padding: '0 1.2rem 1.5rem' }}
      >
        <div
          style={{
            background: '#111111', borderRadius: 20,
            padding: '4rem 2rem', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Green glow */}
          <div style={{
            position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)',
            width: 400, height: 200,
            background: 'radial-gradient(ellipse at center, rgba(59,107,74,0.45) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '1rem', position: 'relative' }}>
            Don&apos;t let your idea sit{' '}
            <span style={{ color: '#7BC98A' }}>idly.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', position: 'relative' }}>
            File it today. Timestamp it. Find your team.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', position: 'relative' }}>
            <Link
              href="/request-invite"
              style={{
                background: '#3B6B4A', color: '#fff', borderRadius: 100,
                padding: '0.75rem 1.8rem', fontSize: '0.87rem', fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
              }}
            >
              Request an invite
            </Link>
            <Link
              href="/login"
              style={{
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', borderRadius: 100,
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.75rem 1.8rem', fontSize: '0.87rem', fontWeight: 400,
                fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #E5E3DC', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.95rem' }}>
          <span style={{ color: '#3B6B4A' }}>ID</span>fy
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#CCCCCC' }}>By invitation only.</span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem', color: '#CCCCCC' }}>© 2026</span>
      </footer>
    </div>
  )
}
